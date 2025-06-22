const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-4 text-center">
      © {new Date().getFullYear()} FundFlow - Crowdfunding DApp
    </footer>
  );
};

export default Footer;