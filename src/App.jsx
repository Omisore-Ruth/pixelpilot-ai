import { useState } from "react";

import Workspace from "./Workspace";
import AuthPage from "./pages/AuthPage";
import { useAuth } from "./hooks/useAuth";
import logo from "./assets/pixelpilot-logo.webp";
import "./styles/AuthPage.css";

// Shows the login screen until someone is signed in, then the workspace.
function App() {
  const { user, loading, recovering, finishRecovery } = useAuth();
  // True only when the user has just signed in by clicking a button, which is
  // also what lets the browser play Pixie's spoken welcome.
  const [justSignedIn, setJustSignedIn] = useState(false);

  if (loading) {
    return (
      <div className="auth-splash" aria-busy="true" aria-label="Loading PixelPilot">
        <img src={logo} alt="PixelPilot AI" width="520" height="173" />
      </div>
    );
  }

  if (!user || recovering) {
    return (
      <AuthPage
        recovering={recovering}
        onRecovered={() => {
          finishRecovery();
          setJustSignedIn(true);
        }}
        onSignInStart={() => setJustSignedIn(true)}
      />
    );
  }

  // key resets everything (saved components, preview, Pixie) when the account changes.
  return <Workspace key={user.id} user={user} welcomeOnMount={justSignedIn} />;
}

export default App;
