import { AuthProvider } from "../context/AuthContext";
import RouterApp from "./RouterApp";

export default function App() {
  return (
    <AuthProvider>
      <RouterApp />
    </AuthProvider>
  );
}