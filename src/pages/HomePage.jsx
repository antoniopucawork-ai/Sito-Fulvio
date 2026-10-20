import Navbar from "../components/Navbar/Navbar.jsx";
import Hero from "../components/hero/Hero.jsx";
import UserChoice from "../components/UserChoice/UserChoice.jsx";
import BookingCTA from "../components/BookingCTA/BookingCTA.jsx";

const HomePage = () => {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <UserChoice />
        <BookingCTA />
      </main>
    </>
  );
};

export default HomePage;
