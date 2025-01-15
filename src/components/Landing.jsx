import React from "react";
import { FaComments, FaBolt, FaShieldAlt, FaUsers, FaChartBar, FaGlobe } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import image from '../assets/image.png'
import getCloseImg from '../assets/get-close.svg';
import getOrganizedImg from '../assets/get-organized.svg';
import getFrontImg from '../assets/get-front.svg';

function Landing() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
            {/* Enhanced Hero Section */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            <div className="absolute inset-0">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Navigation */}
            <nav className="relative z-50 border-b border-white/10 backdrop-blur-sm">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative px-3 py-2 bg-black rounded-lg leading-none flex items-center">
                                    <FaComments className="h-6 w-6 text-blue-500" />
                                    <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text">ChatFlow</span>
                                </div>
                            </div>
                    </div>
                    
                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center gap-8">
                            {['Features', 'Solutions', 'Pricing'].map((item) => (
                                <a 
                                    key={item} 
                                    href={`#${item.toLowerCase()}`}
                                    className="text-sm text-gray-300 hover:text-white transition-colors relative group py-2"
                                >
                                    <span className="relative z-10">{item}</span>
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 group-hover:w-full transition-all duration-300"></span>
                                </a>
                            ))}
                            
                        <button
                            onClick={() => navigate("/login")}
                                className="relative inline-flex items-center px-4 py-2 overflow-hidden text-sm font-medium transition-all rounded-lg group"
                        >
                                <span className="absolute inset-0 border-2 border-white/30 rounded-lg"></span>
                                <span className="relative">Sign in</span>
                        </button>

                        <button
                            onClick={() => navigate("/signup")}
                                className="relative inline-flex items-center px-6 py-2 overflow-hidden text-sm font-medium transition-all rounded-lg group"
                        >
                                <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg"></span>
                                <span className="relative">Get Started</span>
                        </button>
                        </div>
                    </div>
                    </div>
                </nav>

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        {/* Left Content */}
                        <div className="lg:w-1/2 space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-sm text-gray-300">AI-Powered Customer Support</span>
                            </div>
                            
                            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                                Transform Your
                                <span className="block mt-2 bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400 text-transparent bg-clip-text">
                                    Customer Experience
                                </span>
                            </h1>
                            
                            <p className="text-xl text-gray-300 leading-relaxed">
                                Elevate your customer support with AI-powered conversations, real-time analytics, 
                                and seamless team collaboration.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                    <div className="relative px-8 py-3 bg-black rounded-full leading-none flex items-center">
                                        <span className="text-white">Start Free Trial</span>
                                        <span className="ml-3 group-hover:translate-x-2 transition-transform">→</span>
                                    </div>
                                </button>

                                <button className="px-8 py-3 rounded-full border border-white/10 hover:bg-white/5 transition-colors flex items-center gap-3">
                                    <span className="h-6 w-6 flex items-center justify-center rounded-full bg-white/10">
                                        ▶
                                    </span>
                                    Watch Demo
                                </button>
                            </div>
                        </div>
                        
                        {/* Right Content - Dashboard Preview */}
                        <div className="lg:w-1/2 relative">
                            <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                <img 
                                    src={image} 
                                    alt="Dashboard Preview"
                                    className="w-full h-auto"
                                />
                            </div>

                            {/* Floating Stats */}
                            <div className="absolute -right-8 top-1/3 transform translate-x-1/2 -translate-y-1/2">
                                <div className="animate-float">
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <span className="text-sm">1,234 Active Users</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative py-24 bg-slate-800/50">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                
                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-6">
                            <span className="text-sm text-gray-300">Powerful Features</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Everything you need for
                            <span className="block mt-2 bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400 text-transparent bg-clip-text">
                                excellent support
                            </span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <FaBolt className="h-6 w-6" />,
                                title: "Real-time Chat",
                                description: "Engage with customers instantly through our lightning-fast messaging system.",
                                gradient: "from-yellow-500 to-orange-500"
                            },
                            {
                                icon: <FaShieldAlt className="h-6 w-6" />,
                                title: "Secure & Reliable",
                                description: "Enterprise-grade security with end-to-end encryption and 99.99% uptime.",
                                gradient: "from-blue-500 to-indigo-500"
                            },
                            {
                                icon: <FaUsers className="h-6 w-6" />,
                                title: "Team Collaboration",
                                description: "Work seamlessly with your team using shared inboxes and assignments.",
                                gradient: "from-emerald-500 to-green-500"
                            }
                        ].map((feature, index) => (
                            <div key={index} className="group relative">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
                                <div className="relative p-8 bg-slate-900 rounded-xl border border-white/10">
                                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.gradient} mb-6`}>
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                                    <p className="text-gray-400">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section className="relative py-24">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2 space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                                <span className="text-sm text-gray-300">Simple Integration</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold">
                                How does it
                                <span className="block mt-2 bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text">
                                    work?
                                </span>
                            </h2>
                            <p className="text-gray-400 text-xl">
                                Add a small JavaScript snippet to your site — it takes 30 seconds to get started
                            </p>

                            <div className="space-y-6">
                                {[
                                    'Copy the code snippet',
                                    'Paste it into your website',
                                    'Customize the appearance',
                                    'Start chatting with customers'
                                ].map((step, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 rounded-lg border border-white/10 bg-white/5">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 flex items-center justify-center">
                                            {index + 1}
                                        </div>
                                        <span>{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:w-1/2">
                            <div className="relative">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl blur opacity-30"></div>
                                <div className="relative bg-slate-900 p-6 rounded-xl border border-white/10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex space-x-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        </div>
                                        <span className="text-sm text-gray-400">script.js</span>
                                    </div>
                                    <pre className="text-sm text-gray-300 font-mono">
                                        <code>{`<script>
  window.chatConfig = {
    websiteId: "your-website-id",
    position: "bottom-right"
  }
</script>
<script 
  src="https://chatbot.pizeonfly.com/widget.js" 
  async
></script>`}</code>
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="relative py-24 bg-slate-800/50">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl md:text-5xl font-bold mb-8">
                            Ready to transform your
                            <span className="block mt-2 bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text">
                                customer support?
                            </span>
                        </h2>
                        <p className="text-xl text-gray-400 mb-12">
                            Join thousands of businesses that use ChatFlow to provide exceptional customer service.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-1000"></div>
                                <div className="relative px-8 py-3 bg-black rounded-full leading-none flex items-center">
                                    <span>Start Free Trial</span>
                                    <span className="ml-3 group-hover:translate-x-2 transition-transform">→</span>
                                </div>
                            </button>
                            <button className="px-8 py-3 rounded-full border border-white/10 hover:bg-white/5 transition-colors">
                                Contact Sales
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer Section */}
            <footer className="relative bg-slate-900 border-t border-white/10 w-full">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                
                <div className="container mx-auto px-6 py-20 relative z-10">
                    {/* Main Footer Content */}
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-16 max-w-full overflow-x-hidden">
                        {/* Brand Column */}
                        <div className="col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg blur opacity-60"></div>
                                    <div className="relative px-3 py-2 bg-black rounded-lg leading-none flex items-center">
                                        <FaComments className="h-6 w-6 text-blue-500" />
                                        <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text">
                                            ChatFlow
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-400 mb-6">
                                Empowering businesses with intelligent customer communication solutions. 
                                Transform your customer support experience today.
                            </p>
                            <div className="flex gap-4">
                                {['twitter', 'github', 'linkedin'].map((social) => (
                                    <a
                                        key={social}
                                        href={`https://${social}.com`}
                                        className="p-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <span className="sr-only">{social}</span>
                                        <FaComments className="h-5 w-5 text-gray-400" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Quick Links */}
                        {[
                            {
                                title: "Product",
                                links: ["Features", "Integrations", "Pricing", "Changelog", "Documentation"]
                            },
                            {
                                title: "Company",
                                links: ["About", "Blog", "Careers", "Press", "Partners"]
                            },
                            {
                                title: "Resources",
                                links: ["Community", "Contact", "DPA", "Privacy Center"]
                            },
                            {
                                title: "Legal",
                                links: ["Privacy", "Terms", "Security", "Cookies"]
                            }
                        ].map((column, index) => (
                            <div key={index} className="col-span-1">
                                <h3 className="text-white font-semibold mb-4">{column.title}</h3>
                                <ul className="space-y-3">
                                    {column.links.map((link, linkIndex) => (
                                        <li key={linkIndex}>
                                            <a 
                                                href="#" 
                                                className="text-gray-400 hover:text-white transition-colors inline-flex items-center group"
                                            >
                                                <span>{link}</span>
                                                <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200">
                                                    →
                                                </span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                   
                    {/* Bottom Bar */}
                    <div className="border-t border-white/10 pt-8 w-full">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-full">
                            <div className="text-gray-400 text-sm">
                                © 2024 ChatFlow. All rights reserved.
                            </div>
                            <div className="flex gap-6 text-sm flex-wrap justify-center">
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookies</a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Rest of your sections with similar styling... */}
        </div>
    );
}

export default Landing;

