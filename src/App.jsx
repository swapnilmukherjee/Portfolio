import React, { useState, useEffect, useRef } from 'react';
import {
    Menu,
    X,
    Github,
    Linkedin,
    Mail,
    Download,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    Code,
    Briefcase,
    GraduationCap,
    User,
    Send,
    Calendar,
    Shield,
    Terminal,
    Lock,
    Award,
    Maximize2,
    MapPin,
    Bug,
    Pizza,
    Rocket,
    Activity,
    Mic,
    Heart,
    Twitter,
    Cpu,
    CreditCard,
    Palette
} from 'lucide-react';

// --- UI Components ---

// Helper icon for card link
const ArrowUpRight = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <line x1="7" y1="17" x2="17" y2="7" />
        <polyline points="7 7 17 7 17 17" />
    </svg>
);

const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, disabled, href, target }) => {
    const baseStyle = "inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-300 transform active:scale-95 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed tracking-tight";

    const variants = {
        primary: "bg-white text-black hover:bg-gray-100 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]",
        secondary: "bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md",
        outline: "border border-white/20 text-gray-300 hover:text-white hover:border-white/50 hover:bg-white/5",
        ghost: "text-gray-400 hover:text-white hover:bg-white/5 p-2 rounded-lg"
    };

    const classes = `${baseStyle} ${variants[variant]} ${className}`;

    const Content = () => (
        <>
            {variant === 'primary' && <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer"></div>}
            {Icon && <Icon className="w-4 h-4 mr-2.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 inline-block" />}
            <span className="relative z-10">{children}</span>
        </>
    );

    if (href) {
        return (
            <a href={href} target={target} rel={target === '_blank' ? "noopener noreferrer" : undefined} className={classes} onClick={onClick}>
                <Content />
            </a>
        );
    }

    return (
        <button onClick={onClick} disabled={disabled} className={classes}>
            <Content />
        </button>
    );
};

const SectionTitle = ({ title, subtitle }) => (
    <div className="mb-20 animate-on-scroll opacity-0 translate-y-8 transition-all duration-1000">
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tighter">
            {title}
            <span className="text-purple-500">.</span>
        </h2>
        {subtitle && <p className="text-gray-400 text-lg md:text-xl max-w-2xl font-light leading-relaxed">{subtitle}</p>}
    </div>
);

// --- Spotlight Card Component ---
const Card = ({ children, className = "", spotlightColor = "rgba(255,255,255,0.1)" }) => {
    const divRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e) => {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleMouseEnter = () => setOpacity(1);
    const handleMouseLeave = () => setOpacity(0);

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`relative bg-[#0A0A0A]/80 border border-white/5 rounded-3xl p-8 transition-all duration-500 group hover:shadow-2xl hover:shadow-purple-900/10 backdrop-blur-sm overflow-hidden ${className}`}
        >
            {/* Spotlight Gradient - Wide 1200px glow */}
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
                style={{
                    opacity,
                    background: `radial-gradient(1200px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`
                }}
            />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

// --- Profile Image Component with Fallback ---
const ProfileImage = () => {
    const [imageError, setImageError] = useState(false);

    if (imageError) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-[#1A1A1A] text-gray-600 rounded-full">
                <User className="w-16 h-16" />
            </div>
        );
    }

    return (
        <img
            src="image.png"
            alt="Swapnil Mukherjee"
            className="w-full h-full object-cover rounded-full"
            onError={() => setImageError(true)}
        />
    );
};

// --- Project Art Component ---
const ProjectArt = ({ type, className = "" }) => {
    const baseClass = `w-full h-full flex items-center justify-center relative overflow-hidden ${className}`;

    const icons = {
        trip: <MapPin className="w-16 h-16 text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />,
        bug: <Bug className="w-16 h-16 text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />,
        food: <Pizza className="w-16 h-16 text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />,
        lock: <Lock className="w-16 h-16 text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />,
        space: <Rocket className="w-16 h-16 text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />,
        chart: <Activity className="w-16 h-16 text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />,
        voice: <Mic className="w-16 h-16 text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />,
        health: <Heart className="w-16 h-16 text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />,
        social: <Twitter className="w-16 h-16 text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />,
        art: <Palette className="w-16 h-16 text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />,
        chip: <Cpu className="w-16 h-16 text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />,
        card: <CreditCard className="w-16 h-16 text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />,
    };

    const gradients = {
        trip: "bg-gradient-to-br from-cyan-600 to-blue-700",
        bug: "bg-gradient-to-br from-purple-600 to-pink-700",
        food: "bg-gradient-to-br from-red-500 to-orange-600",
        lock: "bg-gradient-to-br from-rose-600 to-red-700",
        space: "bg-gradient-to-br from-violet-600 to-indigo-700",
        chart: "bg-gradient-to-br from-emerald-500 to-teal-700",
        voice: "bg-gradient-to-br from-teal-500 to-emerald-600",
        health: "bg-gradient-to-br from-lime-500 to-green-600",
        social: "bg-gradient-to-br from-sky-500 to-blue-600",
        art: "bg-gradient-to-br from-pink-500 to-rose-600",
        chip: "bg-gradient-to-br from-amber-500 to-orange-600",
        card: "bg-gradient-to-br from-blue-600 to-indigo-700",
    };

    return (
        <div className={baseClass}>
            {/* Abstract Background Shape */}
            <div className={`absolute inset-0 opacity-20 ${gradients[type]}`}></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30"></div>

            {/* Glowing Orb Behind Icon */}
            <div className={`absolute w-32 h-32 rounded-full blur-[60px] opacity-40 ${gradients[type]}`}></div>

            {/* Icon Container - Clean look, no box */}
            <div className="relative z-10 transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 ease-out">
                {icons[type] || <Code className="w-16 h-16 text-white/90" />}
            </div>
        </div>
    );
};

// --- Data ---
const portfolioData = {
    name: "Swapnil Mukherjee",
    title: "IAM and CIAM Engineer",
    shortBio: "Identity specialist building secure, zero-trust authentication platforms.",
    about: "I am an IAM and CIAM engineer with deep experience in Auth0, Ping, and Okta across financial and healthcare environments. I build and operate customer and workforce identity platforms end-to-end, covering SSO, MFA, and lifecycle automation. My expertise lies in protocols like OAuth 2.0, OIDC, SAML, and SCIM, delivered through CI/CD pipelines.",
    email: "swapnilmukherjee.jobs@gmail.com",
    socials: {
        github: "https://github.com/swapnilmukherjee/",
        linkedin: "https://www.linkedin.com/in/swapnilmukherjee24/",
        twitter: "#"
    },
    technicalSkills: [
        {
            category: "Identity & Access",
            icon: Lock,
            skills: ["Auth0", "PingFederate", "PingDirectory", "Okta", "SailPoint IIQ", "CyberArk", "Active Directory", "OAuth 2.0 / OIDC", "SAML 2.0", "SCIM"]
        },
        {
            category: "Security & DevOps",
            icon: Shield,
            skills: ["Zero Trust Architecture", "Terraform", "Splunk", "Dynatrace", "GitHub Actions", "Jenkins", "Fuzzing (AFL/Peach)", "Cryptography"]
        },
        {
            category: "Engineering & Data",
            icon: Terminal,
            skills: ["Python", "JavaScript", "Java", "C++", "Flask", "REST APIs", "SQL / MySQL", "AWS (RDS, Lambda)", "Matplotlib"]
        }
    ],
    certifications: [
        { name: "AWS Cloud Technology Consultant Specialization", issuer: "AWS", color: "rgba(255, 215, 0, 0.15)" },
        { name: "AWS for Developers: Identity Access Management (IAM)", issuer: "LinkedIn", color: "rgba(10, 102, 194, 0.15)" },
        { name: "Google Cloud Platform for Enterprise", issuer: "LinkedIn", color: "rgba(10, 102, 194, 0.15)" },
        { name: "Introduction to Cloud Identity", issuer: "Google", color: "rgba(219, 68, 55, 0.15)" },
        { name: "Web Security: OAuth and OpenID Connect", issuer: "LinkedIn", color: "rgba(10, 102, 194, 0.15)" },
        { name: "Azure for Architects: Design for Identity and Security", issuer: "LinkedIn", color: "rgba(10, 102, 194, 0.15)" },
        { name: "Microsoft Azure: Identity and Access Management (2023)", issuer: "LinkedIn", color: "rgba(10, 102, 194, 0.15)" }
    ],
    experience: [
        {
            id: 1,
            role: "Security Engineer II - CIAM",
            company: "Fifth Third Bank",
            contractInfo: "Contractor via CBTS",
            period: "Jun 2024 - Present",
            color: "from-green-500 to-emerald-700",
            spotlightColor: "rgba(16, 185, 129, 0.2)", // Green glow
            shortDescription: "Lead CIAM engineering for the Newline commercial banking platform. Delivered a zero-downtime Auth0 to Ping migration and wrapped the identity stack in Terraform/GitHub/Jenkins, adding Splunk dashboards for proactive auth monitoring.",
            description: `Design and operate customer Identity and Access Management (IAM) for the Newline commercial banking platform, delivering CIAM first on Auth0 and now on Ping Identity (PingFederate, PingAccess and PingDirectory). Implement tenant configuration, OAuth 2.0 / OIDC / SAML 2.0 SSO flows, adaptive MFA, biometric authentication, fine-grained RBAC and hardened password policies aligned with Zero Trust. Build custom Auth0 Actions, Rules and Hooks and equivalent Ping policies and flows in JavaScript to support registration, login, step up authentication, token enrichment and credential management integrated with internal REST services.

Lead the end-to-end migration from Auth0 to Ping Identity, including gap analysis, attribute and claim mapping, PingDirectory schema and data model design, user and credential migration, application re-onboarding into PingFederate and coordinated cutover testing to maintain a consistent customer login experience. Define joiner-mover-leaver logic, automated provisioning and de-provisioning workflows, group and role strategies and access review processes aligned with SOX, GLBA, PCI DSS, NIST 800-53 and internal audit requirements.

Maintain CI/CD pipelines for IAM configuration and identity-related microservices using GitHub, Jenkins, CLI tooling and Terraform. Configure Splunk and Dynatrace monitoring, service runbooks and SOPs to track authentication health, reduce production incidents and support structured incident response across engineering and security teams.`,
            skills: ["Auth0", "PingFederate", "DevOps"]
        },
        {
            id: 2,
            role: "IAM Systems Engineer",
            company: "Cardinal Health",
            contractInfo: "Consultant via TCS",
            period: "Jul 2020 - Aug 2022",
            color: "from-red-600 to-pink-700",
            spotlightColor: "rgba(220, 38, 38, 0.2)", // Red glow
            shortDescription: "Okta SME for a global healthcare enterprise (22k+ identities). Migrated 100+ legacy apps to Okta, rolled out adaptive MFA, and partnered with SailPoint/CyberArk to tighten privileged access security.",
            description: `Lead Okta-based IAM platform engineering as the Okta subject matter expert for a regulated healthcare enterprise, directing a team of 8 engineers and owning SSO and access management for 22,000+ workforce identities. Design and operate SSO patterns with SAML 2.0, OIDC and OAuth 2.0 and onboard 100+ B2E, B2B and B2C applications across on-premises and cloud environments federated with Active Directory and Okta. Migrate legacy applications to Okta-based identity services and roll out MFA and adaptive MFA policies across legacy and modern platforms to strengthen authentication and align with enterprise security and compliance requirements, including SOC 2, ISO 27001 and HIPAA.

Support SailPoint IdentityIQ for account aggregation, connector configuration, joiner mover leaver lifecycle workflows and access reviews so that identities, entitlements and certifications remain consistent across Active Directory, Okta and key enterprise systems. Collaborate with CyberArk teams to define privileged access patterns that complement SSO and identity governance, reducing unmanaged or orphaned access to high-risk accounts and improving overall control of administrative access.

Administer Linux and Red Hat servers and proxy infrastructure underpinning the IAM stack, implementing automation and upgrade routines to reduce downtime and stabilize SSO and access services during the client’s cloud transition. Use logging and monitoring to detect issues early, support incident response and maintain a reliable workforce identity platform for distributed teams and critical healthcare operations.`,
            skills: ["Okta", "SailPoint", "CyberArk"]
        },
        {
            id: 3,
            role: "Software Development Intern",
            company: "Nokia",
            period: "Jan 2019 - Feb 2019",
            color: "from-blue-500 to-cyan-600",
            spotlightColor: "rgba(59, 130, 246, 0.2)", // Blue glow
            shortDescription: "Built JavaScript/Python automation for network tool deployment. Pioneered early work on secure API design and health check logging that informs my current reliability engineering practices.",
            description: `Built JavaScript and Python based automation scripts and internal APIs to streamline deployment and environment configuration for internal network management tools. Designed routines for logging, health checks, credential handling and access controls that improved reliability and operability of development and test environments. Contributed to automated testing workflows and environment monitoring used by engineering teams, gaining early experience with secure API design, automation patterns and infrastructure troubleshooting that now informs my IAM engineering work.`,
            skills: ["JavaScript", "Python", "Automation"]
        }
    ],
    education: [
        {
            id: 1,
            degree: "M.S. Computer Science",
            school: "Clemson University",
            year: "2024",
            details: "Clemson, SC",
            spotlightColor: "rgba(245, 102, 0, 0.15)", // Clemson Orange
            schoolColor: "text-orange-500"
        },
        {
            id: 2,
            degree: "B.Tech. Computer Science",
            school: "Institute of Engineering and Management",
            year: "2020",
            details: "Kolkata, India",
            spotlightColor: "rgba(0, 86, 179, 0.15)", // IEM Blue
            schoolColor: "text-blue-500"
        }
    ],
    projects: [
        {
            id: 1,
            title: "TripShare",
            date: "May 2024",
            visualType: "trip",
            category: "Web Engineering",
            color: "from-cyan-600 to-blue-600",
            shortDescription: "Smart carpooling platform with route matching algorithms and full-stack user management.",
            description: "Developed TripShare, an innovative platform connecting users with similar travel itineraries to reduce costs and emissions. The project involved end-to-end development with robust user registration, trip matching algorithms, and CMS integration. Comprehensive market research guided the development, identifying target segments and creating customer personas. Custom JavaScript functionalities were implemented to enhance user interactions, and beta testing refined the app. Maintained a CI/CD pipeline for smooth deployments.",
            tags: ["JavaScript", "CMS", "Python"]
        },
        {
            id: 2,
            title: "FAST Firmware Fuzzer",
            date: "Feb 2024",
            visualType: "bug",
            category: "Cybersecurity",
            color: "from-purple-600 to-pink-600",
            shortDescription: "Advanced fuzzing framework detecting critical gaps in firmware specifications and legacy systems.",
            description: "The FAST Firmware Fuzzer represents a huge leap in software testing, meticulously engineered to address critical gaps in software specifications. Born from the evolution of the SAFIREFUZZ framework, this refined tool incorporates sophisticated enhancements including bug resolutions and legacy system integration. Employing a unique, synergistic approach that melds the strengths of software specifications (SPEC), code (CODE), and test suites, the FAST Fuzzer masterfully highlights SPEC blind spots.",
            tags: ["Fuzzing", "Python", "C++"]
        },
        {
            id: 3,
            title: "Pizzeria Manager",
            date: "Oct 2023",
            visualType: "food",
            category: "Web Engineering",
            color: "from-red-500 to-rose-600",
            shortDescription: "Robust Java/SQL backend simulating complex store operations, inventory, and order processing.",
            description: "Developed a sophisticated backend system engineered in Java and integrated with a SQL database, designed to replicate and manage a pizza store's operations. The project features an elaborate Java framework, showcasing object-oriented design, modularity, and scalability. It includes a well-structured SQL database schema with scripts for creating tables and efficient data handling. The system adeptly handles various order types and inventory management.",
            tags: ["Java", "SQL", "AWS RDS"]
        },
        {
            id: 4,
            title: "DROWN Attack",
            date: "Sep 2023",
            visualType: "lock",
            category: "Cybersecurity",
            color: "from-red-600 to-orange-600",
            shortDescription: "Executed DROWN attack on SSLv2 servers, recovering private keys to demonstrate protocol risks.",
            description: "Conducted a comprehensive security assessment targeting SSLv2 servers using the DROWN (Decrypting RSA with Obsolete and Weakened eNcryption) attack methodology. Successfully executed a brute-force attack to retrieve the server's private key, enabling unauthorized access and manipulation of server communications over a supposedly secure TLS network. Subsequent stages involved implementing robust mitigation strategies.",
            tags: ["RSA Security", "C", "Cryptography"]
        },
        {
            id: 5,
            title: "Space Hangman",
            date: "Sep 2023",
            visualType: "space",
            category: "Web Engineering",
            color: "from-violet-600 to-fuchsia-600",
            shortDescription: "Interactive web game using Flask/HTML5 with external API integrations for dynamic gameplay.",
            description: "Developed Space Hangman, a web-based game that revamps the traditional Hangman with a celestial twist. Leveraged Flask for backend development in Python, enhancing user experience through integration with HTML5 and CSS. Further augmented gameplay dynamics by incorporating multiple external APIs, showcasing interoperability and seamless integration capabilities.",
            tags: ["CSS", "Python", "Flask"]
        },
        {
            id: 6,
            title: "System Monitoring Tool",
            date: "Apr 2023",
            visualType: "chart",
            category: "Cybersecurity",
            color: "from-emerald-600 to-teal-600",
            shortDescription: "Python CLI tool for real-time tracking of CPU/Network metrics with anomaly alerting.",
            description: "Engineered a Python-based command-line utility to capture and visualize intricate system performance metrics in real-time. Harnessing the capabilities of Psutil for metric collection and Matplotlib for real-time graphical representation, the tool monitors vital metrics including CPU load, memory usage, and network activity. Integrated alert mechanisms provide early warning on anomalous system behavior.",
            tags: ["Cybersecurity", "Python", "Monitoring"]
        },
        {
            id: 7,
            title: "VoiceRx",
            date: "Sep 2022",
            visualType: "voice",
            category: "Automation & IoT",
            color: "from-teal-500 to-emerald-700",
            shortDescription: "Voice-driven EMR interface using Amazon Alexa to automate clinical data entry and updates.",
            description: "Developed a cutting-edge voice assistant UI tailored for Electronic Medical Record (EMR) systems, leveraging the Amazon Alexa API. This pioneering interface automates data entry and updates, enabling healthcare professionals to interact with EMRs via voice commands. The system streamlines clinical workflows and enhances accuracy and security, significantly alleviating administrative burden.",
            tags: ["HCI", "Alexa API", "UI Design"]
        },
        {
            id: 8,
            title: "HealthFit",
            date: "Jun 2022",
            visualType: "health",
            category: "Web Engineering",
            color: "from-lime-600 to-green-600",
            shortDescription: "Wellness app using RESTful APIs to provide personalized daily caloric targets based on user goals.",
            description: "Developed HealthFit, a groundbreaking health and wellness application utilizing Python and RESTful API integration. It offers personalized daily caloric intake suggestions based on individual weight management goals. The application incorporates research-backed data and algorithms to ensure nutritional accuracy and includes robust security measures such as OAuth authentication.",
            tags: ["Python", "RESTful API", "Health"]
        },
        {
            id: 10,
            title: "TweetFeel",
            date: "Nov 2019",
            visualType: "social",
            category: "AI & Data",
            color: "from-sky-600 to-blue-500",
            shortDescription: "NLP sentiment analysis engine for tweets using RNNs to extract structured emotional insights.",
            description: "Developed a sophisticated Natural Language Processing (NLP) model dedicated to extracting and analyzing emotional sentiments from tweets. The dataset was optimized for machine learning by employing advanced text preprocessing techniques. The model uses recurrent neural networks (RNNs) and embedding layers to discern intricate emotional patterns in the textual data.",
            tags: ["Python", "NLP", "AI"]
        },
        {
            id: 11,
            title: "Neural Style Transfer",
            date: "May 2019",
            visualType: "art",
            category: "AI & Data",
            color: "from-pink-600 to-rose-500",
            shortDescription: "Deep learning app blending content and style images for therapeutic and artistic applications.",
            description: "Pioneered a cutting-edge image generation application that combines the 'content' from a source image with the 'style' of a reference image. Employing advanced neural networks and optimization algorithms in Python, this application serves dual purposes: creating AI-infused art and exploring potential therapeutic applications.",
            tags: ["Python", "Neural Networks", "AI"]
        },
        {
            id: 12,
            title: "IoT Automation",
            date: "Jan 2019",
            visualType: "chip",
            category: "Automation & IoT",
            color: "from-orange-500 to-amber-600",
            shortDescription: "Java-based NodeMCU firmware enabling remote control of traditional home appliances.",
            description: "Conceived and developed a pioneering IoT Home Automation solution, leveraging Java to breathe life into the NodeMCU microcontroller. This initiative facilitates a cost-effective method for transforming traditional appliances into connected smart devices, fulfilling the rising demand for budget-friendly smart home adaptability.",
            tags: ["IoT", "Java", "Hardware"]
        },
        {
            id: 13,
            title: "Fraud Detection",
            date: "Jun 2018",
            visualType: "card",
            category: "Cybersecurity",
            color: "from-blue-600 to-indigo-600",
            shortDescription: "ML pipeline using K-Nearest Neighbour tailored for highly imbalanced credit transaction data.",
            description: "Built a fraud detection pipeline in Python using a K-Nearest Neighbour classifier tailored for highly imbalanced transaction data. Engineered features, tuned hyperparameters, and optimized distance metrics to maximize recall and reduce false negatives. Evaluated the model using precision–recall curves and confusion matrices.",
            tags: ["AI/ML", "Python", "Security"]
        }
    ]
};

// --- Modal Component ---
const ProjectModal = ({ project, onClose }) => {
    if (!project) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
                onClick={onClose}
            ></div>
            <div className="relative bg-[#0A0A0A] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">

                {/* Modal Header Image */}
                <div className={`w-full h-64 relative overflow-hidden bg-gradient-to-br ${project.color} shrink-0`}>
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <ProjectArt type={project.visualType} className="scale-150 opacity-50" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent"></div>

                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full bg-black/20 hover:bg-white/10 text-white/70 hover:text-white transition-colors backdrop-blur-sm"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 md:p-10">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                        <div>
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-white/10 bg-white/5 text-white/80 mb-3`}>
                                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${project.color}`}></div>
                                {project.category}
                            </div>
                            <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                                {project.title}
                            </h3>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm font-mono bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                            <Calendar className="w-4 h-4" />
                            {project.date}
                        </div>
                    </div>

                    <div className="prose prose-invert max-w-none mb-10">
                        <p className="text-gray-300 text-lg leading-relaxed font-light whitespace-pre-line">
                            {project.description}
                        </p>
                    </div>

                    <div className="mb-8">
                        <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Technologies Used</h4>
                        <div className="flex flex-wrap gap-2">
                            {project.tags.map((tag) => (
                                <span key={tag} className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-sm border border-white/10 hover:border-white/20 hover:bg-white/10 transition-colors cursor-default">
                  {tag}
                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Experience Modal Component ---
const ExperienceModal = ({ experience, onClose }) => {
    if (!experience) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
                onClick={onClose}
            ></div>
            <div className="relative bg-[#0A0A0A] border border-white/10 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">

                {/* Modal Header with Gradient */}
                <div className={`w-full h-32 relative overflow-hidden bg-gradient-to-r ${experience.color} shrink-0`}>
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full bg-black/20 hover:bg-white/10 text-white/70 hover:text-white transition-colors backdrop-blur-sm"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 md:p-10 -mt-12 relative z-10">
                    <div className="inline-block p-4 rounded-2xl bg-[#0A0A0A] border border-white/10 shadow-2xl mb-6">
                        <Briefcase className="w-8 h-8 text-white" />
                    </div>

                    <div className="mb-8">
                        <h3 className="text-3xl font-bold text-white leading-tight mb-2">
                            {experience.role}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-lg text-gray-300">
                            <span className="font-medium">{experience.company}</span>
                            {experience.contractInfo && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                                    <span className="text-gray-500 text-base italic">{experience.contractInfo}</span>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-purple-400 text-sm font-mono mt-3">
                            <Calendar className="w-4 h-4" />
                            {experience.period}
                        </div>
                    </div>

                    <div className="prose prose-invert max-w-none mb-10">
                        <div className="text-gray-300 text-lg leading-relaxed font-light whitespace-pre-line">
                            {experience.description}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Core Competencies</h4>
                        <div className="flex flex-wrap gap-2">
                            {experience.skills.map((skill) => (
                                <span key={skill} className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-sm border border-white/10 hover:border-white/20 hover:bg-white/10 transition-colors cursor-default">
                  {skill}
                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main App ---

export default function App() {
    const [activeSection, setActiveSection] = useState('home');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');
    const [showAllProjects, setShowAllProjects] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedExperience, setSelectedExperience] = useState(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);

            // Reveal animations
            const reveals = document.querySelectorAll('.animate-on-scroll');
            reveals.forEach((reveal) => {
                const windowHeight = window.innerHeight;
                const elementTop = reveal.getBoundingClientRect().top;
                const elementVisible = 100;

                if (elementTop < windowHeight - elementVisible) {
                    reveal.classList.remove('opacity-0', 'translate-y-8');
                }
            });
        };

        // Reset showAll when category changes
        setShowAllProjects(false);

        // Add a small delay to allow the DOM to repaint
        const timer = setTimeout(() => {
            handleScroll();
        }, 100);

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timer);
        };
    }, [activeCategory]);

    const handleDownloadResume = () => {
        const link = document.createElement('a');
        link.href = 'Resume.pdf';
        link.download = 'Swapnil_Mukherjee_Resume.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(id);
            setIsMobileMenuOpen(false);
        }
    };

    const navItems = [
        { id: 'about', label: 'About' },
        { id: 'experience', label: 'Experience' },
        { id: 'projects', label: 'Projects' },
        { id: 'education', label: 'Education' },
        { id: 'certifications', label: 'Certifications' },
        { id: 'contact', label: 'Contact' },
    ];

    const categories = ['All', 'Cybersecurity', 'Web Engineering', 'Automation & IoT', 'AI & Data'];

    const filteredProjects = activeCategory === 'All'
        ? portfolioData.projects
        : portfolioData.projects.filter(project => project.category === activeCategory);

    // Logic for showing limited or all projects
    const visibleProjects = showAllProjects ? filteredProjects : filteredProjects.slice(0, 6);

    return (
        <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-purple-500/30 selection:text-white overflow-x-hidden">
            {/* CSS for Animations */}
            <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -5%); }
          20% { transform: translate(-10%, 5%); }
          30% { transform: translate(5%, -10%); }
          40% { transform: translate(-5%, 15%); }
          50% { transform: translate(-10%, 5%); }
          60% { transform: translate(15%, 0); }
          70% { transform: translate(0, 10%); }
          80% { transform: translate(-15%, 0); }
          90% { transform: translate(10%, 5%); }
        }
        .animate-shimmer {
          animation: shimmer 1s linear infinite;
        }
        .animate-blob {
          animation: blob 15s infinite ease-in-out;
        }
        .animate-grain {
          animation: grain 8s steps(10) infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .glass-nav {
          background: rgba(5, 5, 5, 0.8);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        /* Blur-in text animation */
        @keyframes blurIn {
          from { opacity: 0; filter: blur(20px); transform: translateY(20px); }
          to { opacity: 1; filter: blur(0); transform: translateY(0); }
        }
        .animate-blur-in {
          animation: blurIn 1s ease-out forwards;
        }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-500 { animation-delay: 500ms; }
        /* Background Grid */
        .bg-grid {
          background-size: 40px 40px;
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
        }
      `}</style>

            {/* Background Layers */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[#050505]"></div>
                <div className="absolute inset-0 bg-grid z-[1]"></div>

                {/* Organic Blurs (Behind Grid) */}
                {/* The requested Purple Backlight (Static & Stronger) */}
                <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-600/20 rounded-full blur-[100px] z-0"></div>

                <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-900/20 rounded-full blur-[150px] animate-blob z-0"></div>
                <div className="absolute top-[30%] right-[-10%] w-[40vw] h-[40vw] bg-blue-900/10 rounded-full blur-[150px] animate-blob animation-delay-2000 z-0"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-[40vw] h-[40vw] bg-emerald-900/10 rounded-full blur-[150px] animate-blob animation-delay-4000 z-0"></div>

                {/* Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_100%)] z-[2]"></div>

                {/* Animated Grain Overlay */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay overflow-hidden z-[3]">
                    <div className="absolute inset-[-200%] w-[400%] h-[400%] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] animate-grain"></div>
                </div>
            </div>

            {/* Navigation */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'glass-nav py-4' : 'bg-transparent py-8'}`}>
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <div
                        className="text-xl font-bold text-white tracking-tight cursor-pointer group"
                        onClick={() => scrollToSection('home')}
                    >
                        Swapnil<span className="text-purple-500 transition-all group-hover:text-white">.</span>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className="text-sm font-medium text-gray-400 hover:text-white transition-colors relative group"
                            >
                                {item.label}
                                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-purple-500 transition-all group-hover:w-full"></span>
                            </button>
                        ))}
                        <Button variant="primary" onClick={handleDownloadResume} className="!py-2.5 !px-5 text-xs font-semibold uppercase tracking-widest">
                            Resume
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-white p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Nav Overlay */}
                {isMobileMenuOpen && (
                    <div className="absolute top-full left-0 w-full bg-[#050505] border-b border-white/10 p-6 animate-in slide-in-from-top-5 shadow-2xl">
                        <div className="flex flex-col space-y-6">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className="text-2xl font-medium text-gray-300 hover:text-white text-left"
                                >
                                    {item.label}
                                </button>
                            ))}
                            <Button variant="primary" onClick={handleDownloadResume} className="w-full mt-4">
                                Download Resume
                            </Button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Content Wrapper */}
            <div className="relative z-10">

                {/* Hero Section */}
                <section id="home" className="min-h-screen flex items-center justify-center pt-20">
                    <div className="max-w-5xl mx-auto px-6 text-center">

                        {/* Name & Photo Header */}
                        <div className="animate-blur-in mb-10 flex flex-col items-center">
                            <div className="relative group cursor-default">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                                <div className="relative w-32 h-32 rounded-full bg-[#0A0A0A] p-1 shadow-2xl overflow-hidden">
                                    <ProfileImage />
                                </div>
                            </div>
                            <h2 className="mt-8 text-xl md:text-2xl font-medium text-gray-400 tracking-tight">
                                Hi, I'm <span className="text-white font-semibold">{portfolioData.name}</span>
                            </h2>
                        </div>

                        <div className="animate-blur-in delay-200">
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 tracking-tighter leading-[1.1]">
                                Securing <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-gray-400">
                  digital identities.
                </span>
                            </h1>
                        </div>

                        <div className="animate-blur-in delay-300">
                            <p className="text-xl md:text-2xl text-gray-400 mb-12 leading-relaxed font-light min-h-[3rem] transition-all duration-300 max-w-2xl mx-auto">
                                {portfolioData.shortBio}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-5 justify-center animate-blur-in delay-500">
                            <Button variant="primary" onClick={() => scrollToSection('experience')} icon={ChevronRight}>
                                Explore Work
                            </Button>
                            <Button variant="secondary" onClick={handleDownloadResume} icon={Download}>
                                Resume
                            </Button>
                        </div>

                        <div className="mt-24 flex justify-center space-x-12 animate-blur-in delay-500">
                            <a href={portfolioData.socials.github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors hover:-translate-y-1 transform duration-300"><Github className="w-6 h-6" /></a>
                            <a href={portfolioData.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors hover:-translate-y-1 transform duration-300"><Linkedin className="w-6 h-6" /></a>
                            <a href={`mailto:${portfolioData.email}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors hover:-translate-y-1 transform duration-300"><Mail className="w-6 h-6" /></a>
                        </div>
                    </div>
                </section>

                <main className="max-w-7xl mx-auto px-6 space-y-32 pb-32">

                    {/* About Section */}
                    <section id="about" className="pt-20">
                        <div className="max-w-6xl mx-auto animate-on-scroll opacity-0 translate-y-8 transition-all duration-1000">
                            <div className="text-center mb-16">
                                <h2 className="text-4xl font-bold text-white mb-6">About Me</h2>
                                <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-transparent mx-auto rounded-full"></div>
                            </div>

                            {/* Bio Card */}
                            <div className="bg-white/5 border border-white/5 backdrop-blur-md rounded-3xl p-8 md:p-12 text-center shadow-2xl mb-12 max-w-4xl mx-auto">
                                <p className="text-lg md:text-xl text-gray-300 leading-relaxed font-light">
                                    {portfolioData.about}
                                </p>
                            </div>

                            {/* Skills Grid - Redesigned & Separated */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {portfolioData.technicalSkills.map((group, idx) => (
                                    <Card
                                        key={idx}
                                        className="flex flex-col h-full"
                                        spotlightColor="rgba(168, 85, 247, 0.15)"
                                    >
                                        <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-6">
                                            <group.icon className="w-8 h-8 text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-500" />
                                            <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-purple-200 transition-colors">{group.category}</h3>
                                        </div>

                                        <div className="flex flex-wrap gap-2.5 content-start">
                                            {group.skills.map(skill => (
                                                <span
                                                    key={skill}
                                                    className="px-3 py-1.5 rounded-lg bg-white/[0.03] text-gray-400 text-xs font-medium border border-white/5 hover:text-white hover:border-purple-500/30 hover:bg-purple-500/10 transition-all cursor-default"
                                                >
                          {skill}
                        </span>
                                            ))}
                                        </div>
                                    </Card>
                                ))}
                            </div>

                        </div>
                    </section>

                    {/* Experience Section */}
                    <section id="experience" className="pt-32">
                        <SectionTitle title="Experience" subtitle="Professional trajectory in Identity & Access Management." />

                        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 md:before:ml-[50%] before:-translate-x-px before:h-full before:w-px before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                            {portfolioData.experience.map((job, index) => (
                                <div
                                    key={job.id}
                                    onClick={() => setSelectedExperience(job)}
                                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group animate-on-scroll opacity-0 translate-y-8 transition-all duration-1000 cursor-pointer"
                                >

                                    {/* Timeline Node */}
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-[#050505] shadow-[0_0_20px_rgba(0,0,0,1)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 group-hover:border-purple-500 group-hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all duration-500">
                                        <Briefcase className="w-4 h-4 text-gray-600 group-hover:text-purple-400 transition-colors duration-500" />
                                    </div>

                                    {/* Card */}
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] relative">
                                        <Card spotlightColor={job.spotlightColor}>

                                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-2 relative z-10">
                                                <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-2">
                                                    {job.role}
                                                    <Maximize2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
                                                </h3>
                                                <span className="text-xs font-mono text-gray-500 mt-1 lg:mt-0 bg-black/30 px-2 py-1 rounded border border-white/5">{job.period}</span>
                                            </div>
                                            <div className="mb-6 relative z-10">
                                                <div className="text-gray-300 font-medium">{job.company}</div>
                                                {job.contractInfo && (
                                                    <div className="text-gray-500 text-sm mt-0.5 italic">{job.contractInfo}</div>
                                                )}
                                            </div>
                                            <p className="text-gray-400 text-sm leading-relaxed mb-6 font-light line-clamp-3 relative z-10">{job.shortDescription}</p>
                                            <div className="flex flex-wrap gap-2 relative z-10">
                                                {job.skills.slice(0, 3).map(skill => (
                                                    <span key={skill} className="text-xs px-3 py-1 rounded-full bg-black/20 text-gray-400 border border-white/5 hover:border-white/20 hover:text-white transition-colors">
                            {skill}
                            </span>
                                                ))}
                                                {job.skills.length > 3 && (
                                                    <span className="text-xs px-3 py-1 rounded-full bg-black/20 text-gray-500 border border-white/5">+ {job.skills.length - 3}</span>
                                                )}
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Projects Section */}
                    <section id="projects" className="pt-20">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                            <SectionTitle title="Selected Work" subtitle="Engineering secure and scalable digital solutions." />

                            {/* Category Filter */}
                            <div className="flex flex-wrap gap-2 animate-on-scroll opacity-0 translate-y-8 transition-all duration-1000 delay-200 mb-8 md:mb-16">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 border uppercase tracking-wide ${
                                            activeCategory === cat
                                                ? 'bg-white text-black border-white'
                                                : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" key={activeCategory}>
                            {visibleProjects.map((project, index) => (
                                <div
                                    key={project.id}
                                    onClick={() => setSelectedProject(project)}
                                    className="group relative rounded-3xl border border-white/5 overflow-hidden hover:border-white/20 hover:bg-white/[0.07] transition-all duration-500 hover:-translate-y-1 animate-on-scroll opacity-0 translate-y-8 shadow-lg flex flex-col cursor-pointer bg-white/5"
                                    style={{ transitionDelay: `${(index % 4) * 100}ms` }}
                                >
                                    {/* Card Glow on Hover */}
                                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br ${project.color}`}></div>

                                    {/* Header / Visual */}
                                    <div className="p-1 relative">
                                        <div className="h-40 w-full rounded-2xl overflow-hidden relative bg-black/40">
                                            <ProjectArt type={project.visualType} />

                                            {/* Badge */}
                                            <div className="absolute top-3 left-3 z-20">
                          <span className="px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-[10px] font-medium text-white border border-white/10 uppercase tracking-wider">
                            {project.category}
                          </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col relative z-10">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-lg font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all duration-300">{project.title}</h3>
                                            <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                                        </div>
                                        <p className="text-gray-400 text-sm leading-relaxed font-light flex-1 line-clamp-3">
                                            {project.shortDescription}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-6">
                                            {project.tags.slice(0, 3).map(tag => (
                                                <span key={tag} className="text-[10px] font-medium px-2 py-1 rounded bg-white/5 text-gray-500 border border-white/5 group-hover:border-white/10 group-hover:text-gray-300 transition-colors">
                          {tag}
                        </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredProjects.length > 6 && (
                            <div className="mt-16 flex justify-center animate-on-scroll opacity-0 translate-y-8 transition-all duration-1000 delay-100">
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowAllProjects(!showAllProjects)}
                                    icon={showAllProjects ? ChevronUp : ChevronDown}
                                    className="!px-8 !text-xs !uppercase !tracking-widest"
                                >
                                    {showAllProjects ? "Show Less" : "View All Projects"}
                                </Button>
                            </div>
                        )}
                    </section>

                    {/* Education Section */}
                    <section id="education" className="pt-20">
                        <SectionTitle title="Education" />
                        <div className="grid md:grid-cols-2 gap-6">
                            {portfolioData.education.map((edu, index) => (
                                <Card key={edu.id} className={`animate-on-scroll opacity-0 translate-y-8`} style={{ transitionDelay: `${index * 150}ms` }} spotlightColor={edu.spotlightColor}>
                                    <div className="flex flex-col h-full justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className={`text-xl font-bold transition-colors duration-300 ${edu.schoolColor ? `group-hover:${edu.schoolColor}` : 'text-white'}`}>{edu.school}</h3>
                                                    <p className="text-purple-400 text-sm mt-1 font-medium">{edu.degree}</p>
                                                </div>
                                                <GraduationCap className={`w-6 h-6 text-gray-600 transition-colors duration-500 ${edu.schoolColor ? `group-hover:${edu.schoolColor}` : 'group-hover:text-white'}`} />
                                            </div>
                                            <p className="text-gray-400 text-sm font-light">{edu.details}</p>
                                        </div>
                                        <div className="mt-6 pt-4 border-t border-white/5 text-right text-xs text-gray-500 font-mono group-hover:text-gray-400 transition-colors">
                                            Class of {edu.year}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* Certifications Section */}
                    <section id="certifications" className="pt-20">
                        <SectionTitle title="Certifications" />
                        <div className="flex flex-wrap justify-center gap-4 animate-on-scroll opacity-0 translate-y-8">
                            {portfolioData.certifications.map((cert, idx) => (
                                <div key={idx} className="w-full md:w-[calc(50%-0.5rem)] relative">
                                    <Card
                                        spotlightColor={cert.color}
                                        className="flex items-center !p-5 h-full cursor-default"
                                    >
                                        <Award className="w-8 h-8 text-purple-400 mr-5 shrink-0" />
                                        <div>
                                            <h3 className="text-white font-medium text-sm leading-snug group-hover:text-gray-200 transition-colors">{cert.name}</h3>
                                            <p className="text-gray-500 text-xs mt-1">{cert.issuer}</p>
                                        </div>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Contact Section */}
                    <section id="contact" className="pt-32 pb-20">
                        <div className="max-w-4xl mx-auto text-center animate-on-scroll opacity-0 translate-y-8 transition-all duration-1000 bg-gradient-to-b from-white/5 to-transparent p-12 rounded-[3rem] border border-white/5 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
                            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 relative z-10">Ready to secure your <br /><span className="text-purple-500">infrastructure?</span></h2>
                            <p className="text-xl text-gray-400 mb-12 font-light max-w-2xl mx-auto relative z-10">
                                I'm always open to discussing new Identity & Access Management projects, architecture, or opportunities.
                            </p>
                            <Button
                                variant="primary"
                                className="!px-12 !py-5 text-lg relative z-10"
                                icon={Send}
                                href={`mailto:${portfolioData.email}`}
                                target="_blank"
                            >
                                Say Hello
                            </Button>
                        </div>
                    </section>

                </main>

                {/* Footer */}
                <footer className="border-t border-white/5 py-12 bg-[#050505] relative z-10">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                        <span className="text-gray-600 text-sm font-light">© {new Date().getFullYear()} {portfolioData.name}. All rights reserved.</span>
                        <div className="flex gap-8">
                            <a href={portfolioData.socials.github} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white cursor-pointer text-sm transition-colors hover:underline decoration-purple-500/50 underline-offset-4">GitHub</a>
                            <a href={portfolioData.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white cursor-pointer text-sm transition-colors hover:underline decoration-purple-500/50 underline-offset-4">LinkedIn</a>
                            <a href={`mailto:${portfolioData.email}`} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white cursor-pointer text-sm transition-colors hover:underline decoration-purple-500/50 underline-offset-4">Email</a>
                        </div>
                    </div>
                </footer>

                {/* Project Details Modal */}
                <ProjectModal
                    project={selectedProject}
                    onClose={() => setSelectedProject(null)}
                />

                {/* Experience Details Modal */}
                <ExperienceModal
                    experience={selectedExperience}
                    onClose={() => setSelectedExperience(null)}
                />
            </div>
        </div>
    );
}