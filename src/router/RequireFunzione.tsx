import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

type Props = {
  slug: string;
  children: React.ReactNode;
};

export default function RequireFunzione({ slug, children }: Props) {
  const { user, hasFunzione, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!hasFunzione(slug)) {
    return <Navigate to="/" />; // oppure pagina 403
  }

  return <>{children}</>;
}