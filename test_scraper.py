import requests
from bs4 import BeautifulSoup

def extract_content(url):
    """
    Fetches the URL (using a proxy if needed) and extracts the main article content
    based on the domain-specific logic derived for Setopati and Gorkhapatra.
    """
    
    # Simple header to mimic a browser
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }

    try:
        # 1. Fetch the content
        # Note: In a real Python script running locally, we might not need the CORS proxy 'api.codetabs.com'
        # unless there are IP restrictions or we want to mimic the frontend exactly.
        # I'll try direct fetch first.
        print(f"Fetching: {url}")
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        html = response.text
        
        soup = BeautifulSoup(html, 'html.parser')
        content_element = None
        domain = ""

        # 2. Determine Logic based on Domain
        if "setopati.com" in url:
            domain = "Setopati"
            # Logic: Select .editor-box, remove ads
            content_element = soup.select_one('.editor-box')
            
            # Cleanup for Setopati
            if content_element:
                for ad in content_element.select('.insert-ad, .media, .ad-item, script, style'):
                    ad.decompose()

        elif "gorkhapatraonline.com" in url:
            domain = "Gorkhapatra"
            # Logic: Select .blog-details with most content
            # Gorkhapatra often has multiple .blog-details divs (some for metadata).
            # We pick the one with the longest text.
            candidates = soup.select('.blog-details')
            if candidates:
                # Find the candidate with the maximum text length
                content_element = max(candidates, key=lambda el: len(el.get_text(strip=True)))
                
                # Cleanup for Gorkhapatra
                if content_element:
                    for trash in content_element.select('.share-buttons, .ads, .meta, script, style'):
                        trash.decompose()
        else:
            print("Domain not recognized for specific extraction. Dumping raw body text.")
            content_element = soup.body

        # 3. Output Result
        if content_element:
            # Get text with decent formatting
            text = content_element.get_text(separator='\n\n', strip=True)
            print(f"\n--- extracted content from {domain} ---\n")
            print(text)
            print("\n----------------------------------------\n")
        else:
            print("Error: Could not find content container.")

    except Exception as e:
        print(f"Error fetching URL: {e}")

if __name__ == "__main__":
    # Test URLs provided by user
    setopati_url = "https://www.setopati.com/social/379513"
    gorkhapatra_url = "https://gorkhapatraonline.com/news/186978" # Example Loksewa article

    print(">>> Testing Setopati Logic...")
    extract_content(setopati_url)
    
    print("\n\n>>> Testing Gorkhapatra Logic...")
    extract_content(gorkhapatra_url)
