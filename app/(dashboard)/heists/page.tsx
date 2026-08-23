import HeistList from "@/components/HeistList";

export default function HeistsPage() {
  return (
    <div className="page-content">
      <p className="hud-label">All Heists</p>
      <HeistList />
    </div>
  );
}
