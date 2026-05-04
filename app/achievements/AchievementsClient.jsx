"use client";
import Image from "next/image";
import { Trophy, CheckCircle, Award, Leaf } from "lucide-react";

const TYPE_CONFIG = {
  milestone: { icon: <Trophy size={20} className="text-blue-600" />, bg: "bg-blue-50", border: "border-blue-100", badge: "bg-blue-100 text-blue-700", label: "Milestone" },
  certification: { icon: <CheckCircle size={20} className="text-green-600" />, bg: "bg-green-50", border: "border-green-100", badge: "bg-green-100 text-green-700", label: "Certification" },
  award: { icon: <Award size={20} className="text-yellow-600" />, bg: "bg-yellow-50", border: "border-yellow-100", badge: "bg-yellow-100 text-yellow-700", label: "Award" },
};

export default function AchievementsClient({ achievements }) {
  const milestones = achievements.filter(a => a.type === "milestone" && a.isActive);
  const certifications = achievements.filter(a => a.type === "certification" && a.isActive);
  const awards = achievements.filter(a => a.type === "award" && a.isActive);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-800 to-green-600 text-white py-20 px-4 text-center">
        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 mx-auto">
          <Trophy size={28} className="text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">Our Achievements</h1>
        <p className="mt-3 text-white/80 text-lg max-w-xl mx-auto">Milestones, certifications and recognition earned through honest farming.</p>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-16 space-y-20">
        {achievements.length === 0 && (
          <div className="text-center py-20">
            <Leaf size={48} className="mx-auto text-green-300 mb-4" />
            <p className="text-gray-500 font-medium">Achievements coming soon!</p>
          </div>
        )}

        {/* Milestones */}
        {milestones.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Trophy size={20} className="text-blue-600" />
              </div>
              <h2 className="text-3xl font-black text-gray-900">Milestones</h2>
            </div>
            <div className="relative border-l-2 border-blue-200 pl-8 space-y-8">
              {milestones.map((a, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-10 w-5 h-5 rounded-full bg-blue-500 border-4 border-white shadow-md" />
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-2">
                    <div className="flex items-center gap-2">
                      {a.year && <span className="text-xs font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full">{a.year}</span>}
                    </div>
                    <h3 className="text-xl font-black text-gray-900">{a.title}</h3>
                    {a.description && <p className="text-gray-600">{a.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <h2 className="text-3xl font-black text-gray-900">Certifications</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {certifications.map((a, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center space-y-4">
                  {a.image && (
                    <div className="w-32 h-24 relative">
                      <Image src={a.image} alt={a.title} fill className="object-contain" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-black text-gray-900">{a.title}</h3>
                    {a.year && <p className="text-xs text-gray-400 font-bold mt-1">{a.year}</p>}
                    {a.description && <p className="text-sm text-gray-500 mt-2">{a.description}</p>}
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-black rounded-full uppercase tracking-widest">Certified</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Awards */}
        {awards.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Award size={20} className="text-yellow-600" />
              </div>
              <h2 className="text-3xl font-black text-gray-900">Awards & Recognition</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {awards.map((a, i) => (
                <div key={i} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-100 p-6 space-y-3">
                  {a.image && (
                    <div className="w-full h-24 relative mb-2">
                      <Image src={a.image} alt={a.title} fill className="object-contain" />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Award size={16} className="text-yellow-500" />
                    {a.year && <span className="text-xs font-black text-yellow-600">{a.year}</span>}
                  </div>
                  <h3 className="font-black text-gray-900">{a.title}</h3>
                  {a.description && <p className="text-sm text-gray-600">{a.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
