
import AttendanceImporter from "./components/AttendanceImporter";
import "./App.css";

function App() {
  return (
    <main className="campus-app">
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">C</div>
          <div>
            <h1>CampusOS</h1>
            <p>Attendance Management Portal</p>
          </div>
        </div>
        <span className="role-badge">Admin Portal</span>
      </header>

      <section className="welcome">
        <p className="eyebrow">ATTENDANCE MANAGEMENT</p>
        <h2>Attendance Import</h2>
        <p>
          Upload student attendance records, validate the data, and review
          errors before integrating records with the backend.
        </p>
      </section>

      <AttendanceImporter />

      <footer className="app-footer">
        CampusOS · Attendance Monitoring
      </footer>
    </main>
  );
}

export default App;
