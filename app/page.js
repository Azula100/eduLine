import AppShell from "@/components/AppShell";
import HomeContent from "@/components/HomeContent";

export const metadata = { title: "EduLine | Онлайн сургалт" };

export default function Home() {
  return (
    <AppShell>
      <HomeContent />
    </AppShell>
  );
}