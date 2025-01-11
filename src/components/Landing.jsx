// import React from 'react';
// import { MessageSquare, Zap, Shield, Users, BarChart, Globe } from 'lucide-react';
// import { useNavigate } from "react-router-dom";

// function Landing() {
//     const navigate = useNavigate();
//     return (
//         <div className="min-h-screen bg-white">
//             {/* Hero Section */}
//             <header className="bg-gradient-to-r from-blue-600 to-blue-700">
//                 <nav className="container mx-auto px-6 py-4">
//                     <div className="flex items-center justify-between">
//                         <div className="flex items-center space-x-2">
//                             <MessageSquare className="h-8 w-8 text-white" />
//                             <span className="text-2xl font-bold text-white">ChatFlow</span>
//                         </div>
//                         <div className="hidden md:flex space-x-8 text-white">
//                             <a href="#features" className="hover:text-blue-200">Features</a>
//                             <a href="#pricing" className="hover:text-blue-200">Pricing</a>
//                             <a href="#contact" className="hover:text-blue-200">Contact</a>
//                             <a onClick={() => {
//                             navigate("/login");
//                         }}  className="hover:text-blue-200">Login</a>
//                         </div>
//                         <button onClick={() => {
//                             navigate("/login");
//                         }} className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-blue-50 transition-colors">
//                             Get Started
//                         </button>
//                     </div>
//                 </nav>

//                 <div className="container mx-auto px-6 py-24">
//                     <div className="flex flex-col md:flex-row items-center">
//                         <div className="md:w-1/2 mb-12 md:mb-0">
//                             <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
//                                 Connect with your customers in real-time
//                             </h1>
//                             <p className="text-xl text-blue-100 mb-8">
//                                 Boost engagement and sales with our powerful live chat solution. Easy to integrate, powerful to use.
//                             </p>
//                             <div className="flex space-x-4">
//                                 <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors">
//                                     Start Free Trial
//                                 </button>
//                                 <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-600 transition-colors">
//                                     Watch Demo
//                                 </button>
//                             </div>
//                         </div>
//                         <div className="md:w-1/2">
//                             <img
//                                 src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=800&q=80"
//                                 alt="Live Chat Dashboard"
//                                 className="rounded-lg shadow-2xl"
//                             />
//                         </div>
//                     </div>
//                 </div>
//             </header>

//             {/* Features Section */}
//             <section className="py-20 bg-gray-50" id="features">
//                 <div className="container mx-auto px-6">
//                     <h2 className="text-3xl font-bold text-center text-gray-800 mb-16">
//                         Everything you need to provide excellent customer support
//                     </h2>
//                     <div className="grid md:grid-cols-3 gap-12">
//                         {[
//                             {
//                                 icon: <Zap className="h-8 w-8 text-blue-600" />,
//                                 title: "Real-time Conversations",
//                                 description: "Engage with visitors the moment they need help with lightning-fast message delivery."
//                             },
//                             {
//                                 icon: <Shield className="h-8 w-8 text-blue-600" />,
//                                 title: "Secure & Reliable",
//                                 description: "Enterprise-grade security with end-to-end encryption and 99.99% uptime guarantee."
//                             },
//                             {
//                                 icon: <Users className="h-8 w-8 text-blue-600" />,
//                                 title: "Team Collaboration",
//                                 description: "Work together seamlessly with team inbox, chat assignments, and internal notes."
//                             },
//                             {
//                                 icon: <BarChart className="h-8 w-8 text-blue-600" />,
//                                 title: "Advanced Analytics",
//                                 description: "Get insights into customer satisfaction, response times, and team performance."
//                             },
//                             {
//                                 icon: <Globe className="h-8 w-8 text-blue-600" />,
//                                 title: "Multi-language Support",
//                                 description: "Connect with customers in their preferred language with automatic translation."
//                             },
//                             {
//                                 icon: <MessageSquare className="h-8 w-8 text-blue-600" />,
//                                 title: "Custom Chatbots",
//                                 description: "Automate responses to common questions and qualify leads 24/7."
//                             }
//                         ].map((feature, index) => (
//                             <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
//                                 <div className="mb-4">{feature.icon}</div>
//                                 <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
//                                 <p className="text-gray-600">{feature.description}</p>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </section>

//             {/* CTA Section */}
//             <section className="bg-blue-600 py-20">
//                 <div className="container mx-auto px-6 text-center">
//                     <h2 className="text-3xl font-bold text-white mb-8">
//                         Ready to transform your customer support?
//                     </h2>
//                     <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
//                         Join thousands of businesses that use ChatFlow to provide exceptional customer service.
//                     </p>
//                     <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors">
//                         Start Your Free Trial
//                     </button>
//                 </div>
//             </section>

//             {/* Footer */}
//             <footer className="bg-gray-900 text-gray-300 py-12">
//                 <div className="container mx-auto px-6">
//                     <div className="grid md:grid-cols-4 gap-8">
//                         <div>
//                             <div className="flex items-center space-x-2 mb-4">
//                                 <MessageSquare className="h-6 w-6" />
//                                 <span className="text-xl font-bold text-white">ChatFlow</span>
//                             </div>
//                             <p className="text-sm">
//                                 Empowering businesses with real-time customer communication solutions.
//                             </p>
//                         </div>
// <div>
//     <h4 className="text-white font-semibold mb-4">Product</h4>
//     <ul className="space-y-2 text-sm">
//         <li><a href="#" className="hover:text-white">Features</a></li>
//         <li><a href="#" className="hover:text-white">Pricing</a></li>
//         <li><a href="#" className="hover:text-white">Security</a></li>
//     </ul>
// </div>
// <div>
//     <h4 className="text-white font-semibold mb-4">Company</h4>
//     <ul className="space-y-2 text-sm">
//         <li><a href="#" className="hover:text-white">About</a></li>
//         <li><a href="#" className="hover:text-white">Careers</a></li>
//         <li><a href="#" className="hover:text-white">Contact</a></li>
//     </ul>
// </div>
// <div>
//     <h4 className="text-white font-semibold mb-4">Legal</h4>
//     <ul className="space-y-2 text-sm">
//         <li><a href="#" className="hover:text-white">Privacy</a></li>
//         <li><a href="#" className="hover:text-white">Terms</a></li>
//         <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
//     </ul>
// </div>
// </div>
{/* <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
    <p>&copy; 2024 ChatFlow. All rights reserved.</p>
</div> */}
//                 </div>
//             </footer>
//         </div>
//     );
// }

// export default Landing;





import React from "react";
import { MessageSquare, Zap, Shield, Users, BarChart, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Landing() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white overflow-hidden">
            {/* Hero Section */}
            <header className="bg-gradient-to-r from-blue-600 to-blue-700 relative overflow-hidden">
                <nav className="container mx-auto px-6 py-4 flex items-center justify-between z-10 relative">
                    <div className="flex items-center space-x-2">
                        <MessageSquare className="h-8 w-8 text-white" />
                        <span className="text-2xl font-bold text-white">ChatFlow</span>
                    </div>
                    <div className="hidden md:flex space-x-8 text-white">
                        <a href="#features" className="hover:text-blue-200 transition-colors">
                            Features
                        </a>
                        <a href="#pricing" className="hover:text-blue-200 transition-colors">
                            Pricing
                        </a>
                        <a href="#contact" className="hover:text-blue-200 transition-colors">
                            Contact
                        </a>
                        <a
                            onClick={() => navigate("/login")}
                            className="hover:text-blue-200 cursor-pointer transition-colors"
                        >
                            Login
                        </a>
                    </div>
                    <button
                        onClick={() => navigate("/login")}
                        className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-blue-50 transition-transform transform hover:scale-105"
                    >
                        Get Started
                    </button>
                </nav>

                <div className="container mx-auto px-6 py-24 relative z-10">
                    <div className="flex flex-col md:flex-row items-center">
                        <div
                            className="md:w-1/2 mb-12 md:mb-0 animate-fade-in"
                            style={{ animationDelay: "0.2s" }}
                        >
                            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
                                Connect with your customers in real-time
                            </h1>
                            <p className="text-xl text-blue-100 mb-8">
                                Boost engagement and sales with our powerful live chat solution. Easy to integrate,
                                powerful to use.
                            </p>
                            <div className="flex space-x-4">
                                <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-transform transform hover:scale-105">
                                    Start Free Trial
                                </button>
                                <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-600 transition-transform transform hover:scale-105">
                                    Watch Demo
                                </button>
                            </div>
                        </div>
                        <div className="md:w-1/2 animate-slide-in" style={{ animationDelay: "0.4s" }}>
                            <img
                                src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=800&q=80"
                                alt="Live Chat Dashboard"
                                className="rounded-lg shadow-2xl transform hover:scale-105 transition-transform"
                            />
                        </div>
                    </div>
                </div>

                {/* Background Decorations */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 opacity-20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-700 opacity-20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            </header>

            {/* Features Section */}
            <section className="py-20 bg-gray-50" id="features">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-16">
                        Everything you need to provide excellent customer support
                    </h2>
                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            {
                                icon: <Zap className="h-8 w-8 text-blue-600" />,
                                title: "Real-time Conversations",
                                description:
                                    "Engage with visitors the moment they need help with lightning-fast message delivery.",
                            },
                            {
                                icon: <Shield className="h-8 w-8 text-blue-600" />,
                                title: "Secure & Reliable",
                                description:
                                    "Enterprise-grade security with end-to-end encryption and 99.99% uptime guarantee.",
                            },
                            {
                                icon: <Users className="h-8 w-8 text-blue-600" />,
                                title: "Team Collaboration",
                                description:
                                    "Work together seamlessly with team inbox, chat assignments, and internal notes.",
                            },
                            {
                                icon: <BarChart className="h-8 w-8 text-blue-600" />,
                                title: "Advanced Analytics",
                                description:
                                    "Get insights into customer satisfaction, response times, and team performance.",
                            },
                            {
                                icon: <Globe className="h-8 w-8 text-blue-600" />,
                                title: "Multi-language Support",
                                description:
                                    "Connect with customers in their preferred language with automatic translation.",
                            },
                            {
                                icon: <MessageSquare className="h-8 w-8 text-blue-600" />,
                                title: "Custom Chatbots",
                                description: "Automate responses to common questions and qualify leads 24/7.",
                            },
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-transform transform hover:scale-105"
                            >
                                <div className="mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="bg-blue-600 py-20 text-center text-white">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold mb-8">
                        Ready to transform your customer support?
                    </h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto">
                        Join thousands of businesses that use ChatFlow to provide exceptional customer service.
                    </p>
                    <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-transform transform hover:scale-105">
                        Start Your Free Trial
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <MessageSquare className="h-6 w-6 text-white" />
                                <span className="text-xl font-bold text-white">ChatFlow</span>
                            </div>
                            <p className="text-sm">
                                Empowering businesses with real-time customer communication solutions.
                            </p>
                        </div>
                        {/* Other Footer Sections */}
                        <div>
                            <h4 className="text-white font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white">Features</a></li>
                                <li><a href="#" className="hover:text-white">Pricing</a></li>
                                <li><a href="#" className="hover:text-white">Security</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white">About</a></li>
                                <li><a href="#" className="hover:text-white">Careers</a></li>
                                <li><a href="#" className="hover:text-white">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white">Privacy</a></li>
                                <li><a href="#" className="hover:text-white">Terms</a></li>
                                <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
                            </ul>
                        </div>

                    </div>
                    <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
                        <p>&copy; 2024 ChatFlow. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Landing;
