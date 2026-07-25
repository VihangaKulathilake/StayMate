import React from 'react';
import { Rocket, ArrowRight, Home, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-900 pt-16 sm:pt-20 pb-12">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-slate-900 to-slate-900 animate-pulse"></div>
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-float"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-float delay-1000"></div>
            </div>

            {/* Pattern Overlay */}
            <div className="absolute inset-0 z-0 opacity-[0.03]" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '40px 40px'
            }}></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid lg:grid-cols-2 gap-10 sm:gap-16 items-center">
                    {/* Content Column */}
                    <div className="text-center lg:text-left space-y-6 sm:space-y-8 max-w-2xl mx-auto lg:mx-0">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-white animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <Rocket className="w-3.5 h-3.5 text-warning" />
                            <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase">Redefining Property Management</span>
                        </div>

                        <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
                            Manage Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-rose-400">
                                Creative Space
                            </span>
                        </h1>

                        <p className="text-base sm:text-xl text-slate-300 font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                            StayMate isn't just a tool; it's your creative partner in managing boarding houses. Experience vibrant analytics, colorful insights, and seamless control.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                            <Button size="lg" className="rounded-full h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform group">
                                Start Creating
                                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button size="lg" variant="outline" className="rounded-full h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg font-bold border-white/20 bg-white/5 text-white backdrop-blur-md hover:bg-white/10 hover:scale-105 transition-transform">
                                Explore Features
                            </Button>
                        </div>
                    </div>

                    {/* Visual Column */}
                    <div className="relative flex justify-center items-center animate-in fade-in zoom-in duration-1000 delay-500">
                        {/* Main Logo Composition */}
                        <div className="relative group">
                            {/* Decorative Orbitals */}
                            <div className="absolute inset-0 -m-4 sm:-m-8 border border-white/5 rounded-full animate-spin-slow"></div>
                            <div className="absolute inset-0 -m-8 sm:-m-16 border border-white/5 rounded-full animate-reverse-spin-slow"></div>

                            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 sm:p-12 flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:bg-white/10 group-hover:border-white/20">
                                <div className="text-center space-y-3 sm:space-y-4">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center mx-auto shadow-2xl shadow-rose-500/20 transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                        <Home className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-white stroke-[2.5px]" />
                                    </div>
                                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter">StayMate</h2>
                                    <div className="w-10 sm:w-12 h-1.5 bg-white/30 rounded-full mx-auto transform translate-y-2"></div>
                                </div>

                                {/* Floating Badge 1 */}
                                <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-white/10 backdrop-blur-md border border-white/20 p-3 sm:p-4 rounded-2xl shadow-xl animate-float">
                                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400 fill-rose-400" />
                                </div>

                                {/* Floating Badge 2 */}
                                <div className="absolute -bottom-6 -left-4 sm:-bottom-8 sm:-left-8 bg-white/10 backdrop-blur-md border border-white/20 p-3 sm:p-4 rounded-2xl shadow-xl animate-float delay-700">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                                        <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-widest">Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 animate-bounce">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Scroll</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-white/30 to-transparent"></div>
            </div>
        </section>
    );
}
