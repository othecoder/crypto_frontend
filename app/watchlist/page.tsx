import { Shell } from "../components/Shell";
import { WatchlistClient } from "./WatchlistClient";

export const dynamic = "force-dynamic";

export default function WatchlistPage() {
  return (
    <Shell>
      <WatchlistClient />
    </Shell>
  );
}
