// NEA Level 7 Electrical Engineer Exam Syllabus

// Root folder IDs for paper categorization
const FIRST_PAPER_ROOT_ID = "0c5c8eff-19bc-427b-ba83-76899cf5a6f0"; // 1st papper
const SECOND_PAPER_ROOT_ID = "79a2bd95-4735-4701-8c0a-e18f67c524b7"; // 2nd papper

// Import FolderNode type from contentApi
import type { FolderNode } from '../services/contentApi';

export interface SyllabusTopic {
    id: string;
    title: string;
    marks?: number;
    subtopics?: string[];
    details?: string;
}

export interface SyllabusSection {
    section: string;
    type: string;
    marks: number;
    duration: string;
    topics: SyllabusTopic[];
}

export interface SyllabusPaper {
    paper: string;
    subject: string;
    fullMarks: number;
    passMarks: number;
    sections: SyllabusSection[];
}

export const NEA_LEVEL_7_SYLLABUS: SyllabusPaper[] = [
    {
        paper: "Paper I",
        subject: "General Knowledge, Intellectual Test, and Institutional Awareness",
        fullMarks: 100,
        passMarks: 40,
        sections: [
            {
                section: "Section A",
                type: "Objective (MCQ)",
                marks: 50,
                duration: "45 Minutes",
                topics: [
                    {
                        id: "gk",
                        title: "1. General Knowledge",
                        marks: 30,
                        subtopics: [
                            "1.1 नेपालको भूगोल र आर्थिक तथा सामाजिक क्रियाकलापः धरातलीय स्वरुपको किसिम र विशेषता, नेपालमा पाईने हावापानीको किसिम र विशेषता, नदीनाला, तालतलैया, खनिज पदार्थ, प्राकृतिक स्रोत साधन, विद्युत, शिक्षा, स्वास्थ्य र सञ्चारसम्बन्धी जानकारी",
                            "1.2 नेपालको सामाजिक एवं साँस्कृतिक अवस्थाः प्रथा, परम्परा, धर्म, जातजाति, भाषाभाषी, कला, संस्कृति र साहित्य",
                            "1.3 नेपालमा विद्युत विकास, उर्जाका स्रोत र सम्भावना",
                            "1.4 नेपालको संघीय, प्रादेशिक र स्थानीय संरचना तथा शासन प्रणाली सम्बन्धी जानकारी",
                            "1.5 विश्वको भूगोलः महादेश, महासागर, अक्षांश, देशान्तर, अन्तराष्ट्रिय तिथि रेखा, समय, पर्वतश्रृङ्खला, नदी, हिमनदी, ताल, हिमताल",
                            "1.6 अन्तराष्ट्रिय सम्बन्ध तथा संघ/ संस्थाः संयुक्त राष्ट्र संघ र यसका एजेन्सीहरु (UNO and Its Agencies) दक्षिण एशियाली क्षेत्रीय सहयोग संगठन (SAARC) सम्बन्धी जानकारी",
                            "1.7 राष्ट्रिय तथा अन्तराष्ट्रिय महत्वका समसामयिक घटना तथा नविनतम गतिविधिहरु"
                        ]
                    },
                    {
                        id: "iq",
                        title: "2. Intellectual Test",
                        marks: 20,
                        subtopics: [
                            "2.1 Verbal and Non-verbal Aptitude: Vocabulary, Alphabetical ordering of words, Classification, Coding-Decoding, Insert the missing character, Direction and Distance sense test, Ranking order test, Relationship Test, Logical sequence of words, Common sense test, Assertion and Reason, Logical reasoning, Figure series, Figure analogy, Figure Classification, Figure Matrix, Pattern completion/finding, Construction of squares and triangles, Analytical reasoning.",
                            "2.2 Numerical Ability and Quantitative Aptitude: Arithmetical reasoning, Insert the correct mathematical signs, Decimal and Fraction, Percentage, Ratio, Average, Profit and Loss, Time and work."
                        ]
                    }
                ]
            },
            {
                section: "Section B",
                type: "Subjective",
                marks: 50,
                duration: "1 Hour 30 Minutes",
                topics: [
                    {
                        id: "constitution-acts",
                        title: "1. Constitution, Act and Rules",
                        subtopics: [
                            "1.1 Constitution of Nepal",
                            "1.2 Nepal Electricity Authority Act, 2041",
                            "1.3 Electricity Regulatory Commission Act, 2074",
                            "1.4 Electricity Act, 2049 and Electricity Regulation, 2050",
                            "1.5 Public Procurement Act, 2063 and Regulations, 2064",
                            "1.6 Nepal Electricity Authority, Present Financial Administration bylaws",
                            "1.7 Nepal Electricity Authority, Present Employee Service bylaws",
                            "1.8 Corruption Control Act, 2059",
                            "1.9 Good Governance (Management and Operation) Act, 2064",
                            "1.10 Land Acquisition Act, 2034",
                            "1.11 Environment Protection Act, 2076 and Environment Protection Regulation, 2077"
                        ]
                    },
                    {
                        id: "electricity-development",
                        title: "2. Electricity Development in Nepal",
                        subtopics: [
                            "2.1 History of power development in Nepal; Energy supply demand trends.",
                            "2.2 Recent trends in power sector reform; Hydropower potential of Nepal and prospects and challenges for its development.",
                            "2.3 Nepal Electricity Authority: objective, functions, corporate structure, achievement and challenges.",
                            "2.4 Concept of NEA Restructuring in federal context.",
                            "2.5 Reliable and Equality Electricity Services in Administration Development (Nepal: Prospects and Challenges)."
                        ]
                    },
                    {
                        id: "development",
                        title: "3. Development",
                        subtopics: [
                            "3.1 General concept of development administration.",
                            "3.2 Planning in Nepal: efforts, achievement and challenges.",
                            "3.3 Sustainable Development.",
                            "3.4 Public Private Partnership.",
                            "3.5 General Concept of Public Administration and its Function."
                        ]
                    },
                    {
                        id: "management",
                        title: "4. Management and Financial Analysis",
                        subtopics: [
                            "4.1 Concept of Management.",
                            "4.2 Motivation, Leadership, Control, Coordination and Team work, Decision making.",
                            "4.3 Corporate planning and strategic management.",
                            "4.4 Corporate social responsibility.",
                            "4.5 Project management: Use of network models- CPM, PERT, human resource planning and resource scheduling; project monitoring and control; project control cycle.",
                            "4.6 Financial analysis: Methods of financial analysis such as benefit cost ratio, internal rate of return (EIRR and FIRR), net present value, payback period, minimum attractive rate of return and their application; tariff structure."
                        ]
                    },
                    {
                        id: "power-sector",
                        title: "5. New Trends of Power Sector",
                        subtopics: [
                            "5.1 Various Sources of Energy: trend, possibilities and challenges.",
                            "5.2 Role of IPP (Independent Power Producer), opportunities and challenges.",
                            "5.3 Power Purchase Agreement (PPA), Power development agreement (PDA).",
                            "5.4 Concept of energy exchange pool market, energy banking.",
                            "5.5 Regional and sub-regional interconnections with Nepalese grid."
                        ]
                    }
                ]
            }
        ]
    },
    {
        paper: "Paper II",
        subject: "Service Related Comprehensive Knowledge",
        fullMarks: 100,
        passMarks: 40,
        sections: [
            {
                section: "Section A",
                type: "Subjective",
                marks: 50,
                duration: "3 Hours",
                topics: [
                    {
                        id: "fundamentals",
                        title: "1. Electrical Engineering Fundamentals",
                        marks: 10,
                        subtopics: [
                            "1.1 Electric charge and current, direct and alternating currents, electric voltage, potential difference, power and energy.",
                            "1.2 Ohm's Law, Kirchhoff's Law; Star/ Delta and Delta/Star transformation.",
                            "1.3 Network theorems; superposition theorem, maximum power transfer theorem, Thevenin's theorem and Norton's theorem.",
                            "1.4 Inductance and Capacitance in AC circuits; voltage and currents in circuit elements, equivalent inductance and capacitance computations.",
                            "1.5 AC system analysis: concept of phase difference, active and reactive power, complex power, power triangle, power factor, resonance in AC circuits.",
                            "1.6 Three phase systems; balanced and unbalanced systems, voltage current relations and computation of power in three phase systems.",
                            "1.7 Network analysis: Laplace Transform in Circuit Analysis; Transfer Function, Transients in electrical circuits; natural and step response of RL and RC and RLC Circuits, Operational Amplifiers; Inverting and Non-inverting Amplifier Circuits, Two port networks, reciprocity theorems."
                        ]
                    },
                    {
                        id: "machines",
                        title: "2. Electrical Machines",
                        marks: 10,
                        subtopics: [
                            "2.1 Magnetic Circuits: Flux and flux linkage, inductance and energy; magnetic materials and their properties; magnetically induced emf and force; AC operation of magnetic circuits; hysteresis and eddy current losses.",
                            "2.2 Transformers: Equivalent circuits; losses and efficiency; efficiency curves; energy efficiency; regulation; grounding; transformer connections; parallel operation; overloading capacity; temperature rise; auto-transformer and instrument transformers, Testing of transformers and their parameters.",
                            "2.3 DC Machines: Working principles; types; operating characteristics; armature reaction; losses and efficiency; applications, starting and speed control of DC motors.",
                            "2.4 Synchronous Machines: Working principles; operating characteristics; losses and efficiency; steady state and transient equivalent circuits; excitation system and requirement, governor principle; parallel operation; hunting phenomenon.",
                            "2.5 Induction Machines: Working principles; operating characteristics during motoring and generating mode; losses and efficiency; equivalent circuits; starters; speed control and motor selection."
                        ]
                    },
                    {
                        id: "generation",
                        title: "3. Power Generation",
                        marks: 10,
                        subtopics: [
                            "3.1 Hydroelectric Power Plants: Merits and demerits; site selection; classification; elements of hydroelectric power plant and schematic layouts; different types of water turbines; efficiency curves; selection of water turbines; essential features of hydroelectric alternators; choice of size and number of generating units; auxiliaries in hydroelectric plant; Nepalese power plants, their types, salient features and locations.",
                            "3.2 Diesel Electric Power Plants: Construction and operating principles; merits and demerits; application; site selection; schematic arrangement; performance and thermal efficiency.",
                            "3.3 Non-conventional and Renewable Power Generation: Micro hydro, solar photovoltaic, wind, geothermal and tidal power generation schemes and their significance.",
                            "3.4 Economics of power generation: Concept of load curve; load duration curve; mass curve; demand factors; plant factor; utilization factor and plant use factor; significance of load factor and diversity factor in generation planning."
                        ]
                    },
                    {
                        id: "transmission-distribution",
                        title: "4. Transmission and Distribution",
                        marks: 10,
                        subtopics: [
                            "4.1 Transmission: Choice of voltage; conductor size; insulators used in overhead lines; vibration dampers; conductor configuration; clearances; span lengths; sag-tension calculation; pole/tower types; right of way.",
                            "4.2 Line parameters computations, Performance of short, medium and long transmission lines; ABCD constants; surge impedance loading, Ferranti effect.",
                            "4.3 Corona phenomenon: Factors affecting corona and its disadvantages; corona power loss, audible noise and radio interference.",
                            "4.4 Inductive interference between power and communication lines.",
                            "4.5 Distribution Systems: Distribution feeders; conductor size; route selection; pole types; distribution substations; bus bar schemes; effect of load power factor and power factor correction; reactive power compensation; distribution system protection devices; distribution system reliability indices; transformer oil; consumer supply connection; metering system."
                        ]
                    },
                    {
                        id: "system-analysis",
                        title: "5. Power System Analysis",
                        marks: 10,
                        subtopics: [
                            "5.1 Load Flow Study: Load characteristics, effects on voltage and frequency, real power frequency balance, reactive power frequency balance, basic complex power flow equations for a network, voltage profile and VAR compensation, causes and effects of low power factor, advantages and methods of power factor improvement.",
                            "5.2 Stability: Steady state, dynamic and transient stability, equal area criterion, Swing equation for multi machine, Steady-state stability implications, maximum steady state power flow condition.",
                            "5.3 Control and Protection: Faults in power system and their calculation, symmetrical and unsymmetrical faults, components of power system protection, Isolators/Disconnecting switches, contactors, types and characteristics of circuit breakers and protective relays, automatic reclosure, protection of generators, transformers and transmission/distribution lines, lightning protection, Governor's principle and characteristics.",
                            "5.4 Load dispatching: principle of economic load dispatch, requirements, tools and benefits, role of a dispatcher.",
                            "5.5 Transmission System: Choice of voltage, route selection, right of way, substation layout and location.",
                            "5.6 Distribution System: Types of distribution systems, distribution substations, bus bar schemes, power factor correction, protection coordination in distribution systems, distribution system reliability indices, rural distribution system and loss reduction.",
                            "5.7 Quality of Electricity: Supply quality parameters, effect of quality on equipment and application, standards."
                        ]
                    },
                    {
                        id: "power-electronics",
                        title: "6. Power Electronics",
                        marks: 10,
                        subtopics: [
                            "6.1 Power electronics devices; Diode, power transistors, MOSFET, thyristors, GTO, IGBT.",
                            "6.2 Rectifiers; uncontrolled and controlled rectifiers, operation with inductive loads, harmonic filtering, half wave and full wave rectifier circuits and the output waveforms.",
                            "6.3 Inverters: basic details and operation of inverters; voltage source and current source inverters, harmonic filtering.",
                            "6.4 DC choppers; cyclo-converters; AC voltage controllers.",
                            "6.5 Introduction to HVDC transmission lines; advantages and disadvantages, applications."
                        ]
                    }
                ]
            },
            {
                section: "Section B",
                type: "Subjective",
                marks: 50,
                duration: "3 Hours (cont.)",
                topics: [
                    {
                        id: "switchgear",
                        title: "7. Switchgear and Protection",
                        marks: 10,
                        subtopics: [
                            "7.1 Types of protective relays; working principle and application, electromagnetic, static and digital relays.",
                            "7.2 Protection of generators, transformers and transmission and distribution lines.",
                            "7.3 Circuit Breakers: Construction and operating principles of ACB, OCB, VCB, ABCB and SF6 circuit breakers and their applications.",
                            "7.4 Over voltage computations, Protection against switching over voltage and lightening, surge arrestors and their applications.",
                            "7.5 Substations; classification; indoor and outdoor substations; selection and location of site; bus bar arrangements; substation switchgear; substation earthing."
                        ]
                    },
                    {
                        id: "distribution-services",
                        title: "8. Power Distribution and Consumer Services",
                        marks: 10,
                        subtopics: [
                            "8.1 Sub-station & Switchyards: General layout of Sub-station and their key elements.",
                            "8.2 Types of underground cable, cable resistances and capacitances, insulation resistance, selection of cable and selection criteria.",
                            "8.3 Handling of cable and protection, cable joints, single wire power distribution.",
                            "8.4 Lightening phenomenon, lightening arrestors types and function, overhead earth wire, voltage drops, Ferranti effects, SIL of Transmission Line.",
                            "8.5 Earthing of electrical system and electrical equipment. its importance and methods of earthing."
                        ]
                    },
                    {
                        id: "economics",
                        title: "9. Economics of Power Utilization",
                        marks: 10,
                        subtopics: [
                            "9.1 Basic concept about Energy Audit.",
                            "9.2 Load management, TOD meter, Demand side management.",
                            "9.3 Power Factor Improvement: Causes and effects of low power factor, advantages and methods of power factor improvement.",
                            "9.4 Load forecast, demand factor, load factor, plant use factor, diversity factor, depreciation, Rate of Return.",
                            "9.5 Energy Tariffs structure."
                        ]
                    },
                    {
                        id: "safety",
                        title: "10. Safety Engineering",
                        marks: 10,
                        subtopics: [
                            "10.1 Effects of electric shock on human beings, first aid requirements, safety and precautions against electric shocks; safety rules and regulation.",
                            "10.2 Common safety tools and devices for electric utility technician; Technical Standards and performance test of safety tools and devices, significance live line maintenance and relevant precautionary measures.",
                            "10.3 Earthing and shielding techniques; earth resistance and resistivity measurements.",
                            "10.4 Fire hazards; firefighting techniques and equipment for electric utility."
                        ]
                    },
                    {
                        id: "instrumentation",
                        title: "11. Instrumentation and Control",
                        marks: 10,
                        subtopics: [
                            "11.1 Electrical measurements: Classification, working and applications of indicating, recording and integrating instruments for electrical measurements, Analog-digital and Digital-analog converters, concept of precision and error.",
                            "11.2 Sensors and transducers: Sensors and transducers for speed, position, fluid flow and temperature.",
                            "11.3 Automatic feedback control system; time and frequency response of first and second order systems, pole and zero concept, stability criterion, root locus, and bode plots.",
                            "11.4 PID Controller; controlling the transient response and steady state error."
                        ]
                    },
                    {
                        id: "standards",
                        title: "12. Tested Lab of Electrical Machine and Equipment",
                        marks: 10,
                        subtopics: [
                            "12.1 Technical Standards.",
                            "12.2 Accreditation of Lab.",
                            "12.3 Calibration of Testing devices."
                        ]
                    }
                ]
            }
        ]
    }
];

// Folder ID to syllabus topic mapping
export const FOLDER_SYLLABUS_MAP: Record<string, string[]> = {
    // 1st Paper - Notes folders
    "9ef9c9dc-0bc5-4b1e-8610-8b1226238872": ["gk"], // GK (Notes)
    "1778170d-5d75-4288-b406-eb6e4bc9a746": ["iq"], // IQ (Notes)
    "94af0919-344e-4030-b375-0315c5cd4d9f": ["constitution-acts"], // Khanda Kha (Notes)

    // 1st Paper - Videos folders  
    "4d08317e-614a-4e8e-a180-b68d722cb809": ["gk"], // GK (Videos)
    "68da139c-2869-40a5-b3f4-1ba629ee48c9": ["iq"], // IQ (Videos)
    "2a678b73-6f70-4577-9205-c24491cdbecf": ["constitution-acts"], // Khanda Kha (Videos)

    // 2nd Paper - Notes folders
    "f24c6c6b-c8fc-4e46-a1f3-64647abefd63": ["fundamentals"], // 1. Fundamentals (Notes)
    "1a378efa-dba8-45ad-ab62-3ea212a47338": ["machines"], // 2. Electrical Machines (Notes)
    "2fdfa191-3b76-4970-881e-e35519ba84ed": ["generation"], // 3. Power Generation (Videos - also in Notes)
    "573acc82-fd65-4434-b134-3985a902b907": ["transmission-distribution"], // 4. T&D (Notes)
    "b7eeeafa-ad40-468f-8e06-c2ad6d865b1a": ["system-analysis"], // 5. Power System Analysis (Notes)
    "4efa5a9e-8f60-4a0b-a3e1-3676340f2f15": ["safety"], // 10. Safety Engineering (Notes)
    "39ca2d2e-876d-41e0-af9e-97a0a08da1c8": ["instrumentation"], // 11. Instrumentation (Notes)
    "9ceea9d2-c954-490d-8ea6-359d76dc10f5": ["standards"], // 12. Standards (Notes)

    // 2nd Paper - Videos folders
    "ae3b2426-d083-43fd-8568-d58e230597db": ["fundamentals"], // 1. Fundamentals (Videos)
    "2d11121c-1cd5-4ca5-a0c9-738825de8cfa": ["machines"], // 2. Electrical Machines (Videos)
    "5a393e23-ce06-463d-85ed-97f1c71444c6": ["transmission-distribution"], // 4. T&D (Videos)
    "f7ddc6e7-ffa6-46bc-89b6-9ceca67a2058": ["system-analysis"], // 5. Power System Analysis (Videos)
    "fe06efbf-8a5d-4967-84a6-623195a7321b": ["safety"], // 10. Safety Engineering (Videos)
};

// Helper to find path to a folder
function findPathToFolder(nodes: FolderNode[], targetId: string, currentPath: FolderNode[] = []): FolderNode[] | null {
    for (const node of nodes) {
        if (node.id === targetId) {
            return [...currentPath, node];
        }
        if (node.children.length > 0) {
            const path = findPathToFolder(node.children, targetId, [...currentPath, node]);
            if (path) return path;
        }
    }
    return null;
}

// Helper function to find which root paper a folder belongs to
function findRootPaper(folderId: string | null, tree: FolderNode[]): "PAPER_1" | "PAPER_2" | null {
    if (!folderId) return null;

    // Direct match with root folders
    if (folderId === FIRST_PAPER_ROOT_ID) return "PAPER_1";
    if (folderId === SECOND_PAPER_ROOT_ID) return "PAPER_2";

    // Find path to folder
    // Optimized: Single traversal to find the folder and its ancestors
    const path = findPathToFolder(tree, folderId);

    if (!path) return null;

    // Check ancestors in the path
    for (const node of path) {
        if (node.id === FIRST_PAPER_ROOT_ID) return "PAPER_1";
        if (node.id === SECOND_PAPER_ROOT_ID) return "PAPER_2";
    }

    return null;
}

export function getSyllabusForFolder(folderId: string | null, tree?: FolderNode[]): SyllabusPaper[] {

    if (!folderId) {
        // Root level - show full syllabus
        return NEA_LEVEL_7_SYLLABUS;
    }

    // Determine which paper this folder belongs to
    let paperFilter: "PAPER_1" | "PAPER_2" | null = null;
    if (tree) {
        paperFilter = findRootPaper(folderId, tree);
    } else {
    }

    // Get topic-specific filtering if exists
    const topicIds = FOLDER_SYLLABUS_MAP[folderId];

    // Apply paper-level filtering first
    let filteredSyllabus = NEA_LEVEL_7_SYLLABUS;
    if (paperFilter === "PAPER_1") {
        filteredSyllabus = NEA_LEVEL_7_SYLLABUS.filter(paper => paper.paper === "Paper I");
    } else if (paperFilter === "PAPER_2") {
        filteredSyllabus = NEA_LEVEL_7_SYLLABUS.filter(paper => paper.paper === "Paper II");
    } else {
    }

    // If no topic-specific mapping, return paper-filtered syllabus
    if (!topicIds) {
        return filteredSyllabus;
    }

    // Apply topic-level filtering on top of paper filtering
    return filteredSyllabus.map(paper => ({
        ...paper,
        sections: paper.sections.map(section => ({
            ...section,
            topics: section.topics.filter(topic => topicIds.includes(topic.id))
        })).filter(section => section.topics.length > 0)
    })).filter(paper => paper.sections.length > 0);
}
