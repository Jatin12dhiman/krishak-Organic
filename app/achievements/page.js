import { api } from "@/lib/api";
import AchievementsClient from "./AchievementsClient";

export const metadata = {
  title: "Our Achievements | Krishak Organic",
  description: "Explore the milestones, certifications and awards of Krishak Organic.",
};

export const revalidate = 3600;

async function getAchievements() {
  try {
    const res = await api.get("/achievements");
    return res.data?.achievements || [];
  } catch {
    return [];
  }
}

export default async function AchievementsPage() {
  const achievements = await getAchievements();
  return <AchievementsClient achievements={achievements} />;
}
