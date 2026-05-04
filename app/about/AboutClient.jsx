"use client";
import Image from "next/image";
import { Leaf, Target, Eye, Users } from "lucide-react";

export default function AboutClient({ about }) {
  const { brandStory, mission, vision, heroBannerImage, team = [] } = about;

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Banner */}
      <section className="relative w-full h-64 md:h-96 bg-gradient-to-br from-green-800 to-green-600 overflow-hidden">
        {heroBannerImage && (
          <Image src={heroBannerImage} alt="Krishak Organic" fill className="object-cover mix-blend-multiply opacity-60" />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
            <Leaf size={28} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">About Krishak Organic</h1>
          <p className="mt-3 text-white/80 text-lg max-w-xl">Farm-fresh. Honest. Rooted in nature.</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-20">
        {/* Brand Story */}
        {brandStory && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Leaf size={20} className="text-green-600" />
              </div>
              <h2 className="text-3xl font-black text-gray-900">Our Story</h2>
            </div>
            <div className="bg-green-50 rounded-3xl p-8 border border-green-100">
              <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">{brandStory}</p>
            </div>
          </section>
        )}

        {/* Mission & Vision */}
        {(mission || vision) && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {mission && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Target size={24} className="text-blue-600" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed">{mission}</p>
              </div>
            )}
            {vision && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-4">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <Eye size={24} className="text-purple-600" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">Our Vision</h3>
                <p className="text-gray-600 leading-relaxed">{vision}</p>
              </div>
            )}
          </section>
        )}

        {/* Team */}
        {team.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Users size={20} className="text-orange-600" />
              </div>
              <h2 className="text-3xl font-black text-gray-900">Meet the Team</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {team.map((member, i) => (
                <div key={i} className="text-center space-y-3">
                  <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-100">
                    {member.photo ? (
                      <Image src={member.photo} alt={member.name} width={96} height={96} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-black text-green-600">
                        {member.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-black text-gray-900">{member.name}</p>
                    {member.role && <p className="text-sm text-gray-500 font-medium">{member.role}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Fallback if no content */}
        {!brandStory && !mission && !vision && team.length === 0 && (
          <div className="text-center py-20">
            <Leaf size={48} className="mx-auto text-green-300 mb-4" />
            <h2 className="text-2xl font-black text-gray-700">We are Krishak Organic</h2>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">Bringing fresh, natural and organic produce directly from the farm to your doorstep.</p>
          </div>
        )}
      </div>
    </main>
  );
}
