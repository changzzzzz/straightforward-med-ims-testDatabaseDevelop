import Button from "@/ims/components/button";
import "./home.style.scss";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <section className="home">
      <div className="content">
        <div className="header">
          <p className="lead">Welcome to</p>
          <h2>FIT3162 Team 17 Project</h2>
          <h3>
            <span>Post-Traumatic Amnesia Assessment and Diagnosis Program</span>
          </h3>
          <p>To get started please let us know who you are.</p>
        </div>
        <hr />
        <footer>
          {/* <Link to="/request">
            <Button
              name="Patient"
              icon="user-heart"
              type="button"
              variant="outlined"
            />
          </Link> */}
          <Link to="/login">
            <Button
              name="Nurse"
              icon="stethoscope"
              type="button"
              variant="primary"
            />
          </Link>
        </footer>
      </div>
    </section>
  );
};

export default Home;
