import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./Layout/MainLayout"; // Changed from "@"
import RootWrapper from "./Layout/RootWrapper"; // Changed from "@"
import DashBoardLayout from "./Layout/DashBoardLayout"; // Changed from "@"

import HomePage from "./pages/Home/Home"; // Changed from "@"

import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

import VerificationEmailSent from "./pages/EmailVerification/VerificationEmailSent";
import VerificationStatus from "./pages/EmailVerification/VerificationStatus";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import Home from "./pages/Dashboard/Home";
import { MarketNews } from "./pages/Dashboard/News";
import StockHeatMap from "./pages/Dashboard/MarketTrends/StockHeatMap";
import CryptoHeatmap from "./pages/Dashboard/MarketTrends/CryptoHeatmap";
import { AiChatbot } from "./pages/Dashboard/Chatbot";
import EtfHeatmap from "./pages/Dashboard/MarketTrends/EtfHeatmap";
import ForexHeatMap from "./pages/Dashboard/MarketTrends/ForexHeatmap";
import StockPage from "./pages/Dashboard/StockPage";
<<<<<<< HEAD
=======
import Portfolio from "./pages/Dashboard/Portfolio";
import FinancialCalculator from "./pages/Dashboard/FinancialCalculator";
>>>>>>> 5b1ee9e4be8cf0c0b6e53d629a7c45a4efe68e43
import News from "./pages/News/News";

import Profile from "./pages/Profile/Profile";
import LoginForm from "./pages/Login/Login";
import SignUpForm from "./pages/SignUp/SignUp";
import NotFound from "./pages/NotFound/NotFound";
import PasswordResetForm from "./pages/ForgotPassword/PasswordResetForm";
import NearServices from "./pages/NearbyATM/NearServices";
import FAQ from "./pages/FAQ/FAQ";
import Feedback from "./pages/Feedback/Feedback";


const mainLayoutRoutes = [
  {
    path: "/",
    index: true,
    element: <HomePage />,
  },

    {
    path:"/News",
    index : true,
    element : <News/>
  },
  {
    path: "/map",
    index: true,
    element: <NearServices />,
  },

  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/faq",
    element: <FAQ />,
  },
  {
    path: "/feedback",
    element: <Feedback />,
  },
];

const dashboardLayoutRoutes = [
  {
    path: "",
    index: true,
    element: <Home />,
  },
  {
    path: "news",
    index: true,
    element: <MarketNews />,
  },
  {
    path: "analysis",
    index: true,
    element: <StockPage />,
  },
  {
    path: "finance-chatbot",
    index: true,
    element: <AiChatbot />,
  },
  {
    path: "stock-heatmap",
    index: true,
    element: <StockHeatMap />,
  },
  {
    path: "crypto-heatmap",
    index: true,
    element: <CryptoHeatmap />,
  },
  {
    path: "etf-heatmap",
    index: true,
    element: <EtfHeatmap />,
  },
  {
    path: "forex-heatmap",
    index: true,
    element: <ForexHeatMap />,
  },
<<<<<<< HEAD
=======
  {
    path: "portfolio",
    index: true,
    element: <Portfolio />,
  },
  {
    path: "financial-calculator",
    index: true,
    element: <FinancialCalculator />,
  },
>>>>>>> 5b1ee9e4be8cf0c0b6e53d629a7c45a4efe68e43
];

// Create the router with routes
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootWrapper />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: mainLayoutRoutes,
      },
      {
        path: "/",
        element: <ProtectedRoute />,
        children: [
          {
            path: "/dashboard",
            element: <DashBoardLayout />,
            children: dashboardLayoutRoutes,
          },
        ],
      },
      {
        path: "/",
        element: <MainLayout />,
        children: mainLayoutRoutes,
      },
      {
        path: "/Login",
        element: <LoginForm />,
      },
      {
        path: "/SignUp",
        element: <SignUpForm />,
      },
      {
        path: "/verifymail",
        element: <VerificationEmailSent />,
      },
      {
        path: "/verifymail/:verificationToken",
        element: <VerificationStatus />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/reset-password/:resetToken",
        element: <PasswordResetForm />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

export default router;
