import Navbar from "../components/Navbar/Navbar.jsx";
import Hero from "../components/hero/Hero.jsx";
import UserChoice from "../components/UserChoice/UserChoice.jsx";

const HomePage = () => {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <UserChoice />
      </main>
    </>
  );
};

export default HomePage;
