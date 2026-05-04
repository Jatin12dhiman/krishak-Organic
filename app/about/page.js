import { api } from "@/lib/api";
import AboutClient from "./AboutClient";

export const metadata = {
  title: "About Us | Krishak Organic",
  description: "Learn about Krishak Organic — our brand story, mission, vision and the team behind fresh organic produce.",
};

export const revalidate = 3600;

async function getAboutData() {
  try {
    const res = await api.get("/about");
    return res.data || {};
  } catch {
    return {};
  }
}

export default async function AboutPage() {
  const about = await getAboutData();
  return <AboutClient about={about} />;
}
