import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";

import MoviesList from "./pages/Movieslist";
import MovieDetails from "./pages/MovieDetails";
import TheatreSelection from "./pages/TheatreSelection";
import ShowSelection from "./pages/ShowSelection";
import SeatSelection from "./pages/SeatSelection";
import Footer from "./components/Footer";
import Payment from "./Payments";
import Profile from "./pages/Profile";
import MyBookings from "./pages/MyBookings";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Ticket from "./pages/Ticket";
import ProtectedRoute from "./components/Protectedroute";
import AdminDashboard from "./Admin/AdminDashboard";
import AdminMovies from "./Admin/AdminMovies";
import AdminLayout from "./Admin/AdminLayout";
import AdminTheatres from "./Admin/AdminTheatres";
import AdminScreen from "./Admin/AdminScreen";
import AdminShows from "./Admin/AdminShows";
import AdminSeats from "./Admin/AdminSeats";
import AdminBookings from "./Admin/AdminBookings";
import AdminPayments from "./Admin/AdminPayments";
import AdminTickets from "./Admin/Admintickets";
import AdminUsers from "./Admin/Adminusers";
import AdminAnalytics from "./Admin/Adminanalytics";
import AdminSettings from "./Admin/Adminsettings";
// NEW: fraud/anomaly detection admin page
import AdminFraud from "./Admin/AdminFraud";
import ChatWidget from "./components/Chatwidget";

const App = () => {
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Navbar />}

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/movies" element={<MoviesList />} />

        <Route
          path="/movie/:id"
          element={<MovieDetails />}
        />

        <Route
          path="/movie/:movieId/theatres"
          element={<TheatreSelection />}
        />

        <Route
          path="/show/:showId"
          element={<ShowSelection />}
        />

        <Route
          path="/show/:showId/seats"
          element={<SeatSelection />}
        />

         <Route
          path="/payment/:bookingId"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />

 <Route
          path="/login"
          element={<Login/>}
        />

        <Route
          path="/signup"
          element={<Signup/>}
        />

        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <div className="not-found">
              <h1>404</h1>
              <p>Page not found</p>
            </div>
             }
        />
        <Route
  path="/ticket/:bookingId"
  element={
    <ProtectedRoute>
      <Ticket />
    </ProtectedRoute>
  }
/>
     <Route path="/admin" element={<AdminLayout />}>
  <Route index element={<AdminDashboard />} />
  <Route path="movies" element={<AdminMovies />} />
  <Route path="theatres" element={<AdminTheatres />} />
   <Route path="screens" element={<AdminScreen />} />
    <Route path="shows" element={<AdminShows />} />
    <Route path="seats" element={<AdminSeats />} />
    <Route path="bookings" element={<AdminBookings />} />
    <Route  path="payments" element={<AdminPayments />}/>

 <Route
  path="tickets"
  element={<AdminTickets />}
/>

 <Route
  path="users"
  element={<AdminUsers />}
/>

<Route
  path="analytics"
  element={<AdminAnalytics />}
/>

<Route
  path="settings"
  element={<AdminSettings/>}
/>

{/* NEW: fraud/anomaly detection */}
<Route
  path="fraud"
  element={<AdminFraud />}
/>
</Route>

      </Routes>

      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <ChatWidget/>}
    </>
  );
};

export default App;