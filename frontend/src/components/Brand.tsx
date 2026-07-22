import { Feather } from "lucide-react";
import { Link } from "react-router-dom";

export function Brand({ to = "/" }: { to?: string }) {
  return <Link className="brand" to={to} aria-label="Sırdaş AI ana sayfa"><span className="brand-mark"><Feather size={20} /></span><span><strong>Sırdaş AI</strong><small>Bir günlükten fazlası</small></span></Link>;
}
