import { useState } from "react";
import axios from "axios";

function App() {
  const [page, setPage] = useState("home");

  return (
    <div style={{ fontFamily: "Arial", maxWidth: "600px", margin: "0 auto", padding: "20px" }}>

      {/* Header */}
      <div style={{ background: "#1a73e8", color: "white", padding: "20px", borderRadius: "10px", marginBottom: "20px", textAlign: "center" }}>
        <h1 style={{ margin: 0 }}>🚛 Sewage Truck Service</h1>
        <p style={{ margin: "5px 0 0" }}>Fast & Reliable Home Cleaning</p>
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={() => setPage("home")}
          style={{ flex: 1, padding: "10px", background: page === "home" ? "#1a73e8" : "#eee", color: page === "home" ? "white" : "black", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
          📋 Book a Truck
        </button>
        <button onClick={() => setPage("operator")}
          style={{ flex: 1, padding: "10px", background: page === "operator" ? "#1a73e8" : "#eee", color: page === "operator" ? "white" : "black", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
          🚛 Operator Panel
        </button>
      </div>

      {/* Pages */}
      {page === "home"     && <BookingForm />}
      {page === "operator" && <OperatorPanel />}

    </div>
  );
}

function BookingForm() {
  const [form,    setForm]    = useState({ name: "", address: "", phone: "", date: "", time: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const timeSlots = [
    "6:00 AM  - 7:00 AM",
    "7:00 AM  - 8:00 AM",
    "8:00 AM  - 9:00 AM",
    "9:00 AM  - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "12:00 PM - 1:00 PM",
    "1:00 PM  - 2:00 PM",
    "2:00 PM  - 3:00 PM",
    "3:00 PM  - 4:00 PM",
    "4:00 PM  - 5:00 PM",
    "5:00 PM  - 6:00 PM",
  ];

  const handleSubmit = async () => {
    if (!form.name || !form.address || !form.phone || !form.date || !form.time) {
      setMessage("⚠️ Please fill in all fields including date and time.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/bookings", form);
      setMessage("✅ " + res.data.message);
      setForm({ name: "", address: "", phone: "", date: "", time: "" });
    } catch {
      setMessage("❌ Error! Make sure Flask is running.");
    }
    setLoading(false);
  };

  // Get today's date in YYYY-MM-DD format to block past dates
  const today = new Date().toISOString().split("T")[0];

  return (
    <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "10px" }}>
      <h2 style={{ marginTop: 0 }}>Book a Sewage Truck</h2>

      <input placeholder="Your Name" value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />

      <input placeholder="Full Address" value={form.address}
        onChange={e => setForm({ ...form, address: e.target.value })} style={inputStyle} />

      <input placeholder="Phone Number" value={form.phone}
        onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle} />

      {/* Date picker with label */}
      <label style={labelStyle}>📅 When do you need the sewage truck?</label>
      <input
        type="date"
        value={form.date}
        min={today}
        onChange={e => setForm({ ...form, date: e.target.value })}
        style={inputStyle}
      />

      {/* Time slot picker — only shows after date is selected */}
      {form.date && (
        <>
          <label style={labelStyle}>🕐 Choose a time slot</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
            {timeSlots.map(slot => (
              <button
                key={slot}
                onClick={() => setForm({ ...form, time: slot })}
                style={{
                  padding: "10px 8px",
                  borderRadius: "8px",
                  border: form.time === slot ? "2px solid #1a73e8" : "1px solid #ddd",
                  background: form.time === slot ? "#e8f0fe" : "white",
                  color: form.time === slot ? "#1a73e8" : "#333",
                  fontWeight: form.time === slot ? "bold" : "normal",
                  cursor: "pointer",
                  fontSize: "13px",
                  textAlign: "center",
                }}>
                {slot}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Summary before booking */}
      {form.date && form.time && (
        <div style={{ padding: "12px", background: "#e8f0fe", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", color: "#1a73e8" }}>
          📌 Scheduled for <strong>{form.date}</strong> at <strong>{form.time}</strong>
        </div>
      )}

      <button onClick={handleSubmit} disabled={loading}
        style={{ width: "100%", padding: "12px", background: "#1a73e8", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer", fontWeight: "bold" }}>
        {loading ? "Booking..." : "🚛 Book Now"}
      </button>

      {message && (
        <p style={{ marginTop: "15px", padding: "10px", background: "#e8f5e9", borderRadius: "8px" }}>
          {message}
        </p>
      )}
    </div>
  );
}

function OperatorPanel() {
  const [bookings, setBookings] = useState([]);
  const [loaded,   setLoaded]   = useState(false);

  const loadBookings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/bookings");
      setBookings(res.data);
      setLoaded(true);
    } catch {
      alert("❌ Error! Make sure Flask is running.");
    }
  };

  const acceptBooking = async (id) => {
    await axios.put(`http://localhost:5000/api/bookings/${id}/accept`);
    loadBookings();
  };

  return (
    <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "10px" }}>
      <h2 style={{ marginTop: 0 }}>🔧 Operator Panel</h2>
      <button onClick={loadBookings}
        style={{ padding: "10px 20px", background: "#1a73e8", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", marginBottom: "15px" }}>
        🔄 Load Bookings
      </button>

      {loaded && bookings.length === 0 && <p>No bookings yet.</p>}

      {bookings.map(b => (
        <div key={b.id} style={{ background: "white", padding: "15px", borderRadius: "8px", marginBottom: "10px", borderLeft: `4px solid ${b.status === "accepted" ? "#34a853" : "#fbbc04"}` }}>
          <p style={{ margin: "0 0 4px" }}><strong>👤 {b.name}</strong></p>
          <p style={{ margin: "0 0 4px", color: "#555" }}>📍 {b.address}</p>
          <p style={{ margin: "0 0 4px", color: "#555" }}>📞 {b.phone}</p>
          <p style={{ margin: "0 0 4px", color: "#555" }}>📅 {b.date}</p>
          <p style={{ margin: "0 0 8px", color: "#555" }}>🕐 {b.time}</p>
          <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "13px", background: b.status === "accepted" ? "#e6f4ea" : "#fef7e0", color: b.status === "accepted" ? "#34a853" : "#f9ab00", fontWeight: "bold" }}>
            {b.status === "accepted" ? "✅ Accepted" : "⏳ Pending"}
          </span>
          {b.status === "pending" && (
            <button onClick={() => acceptBooking(b.id)}
              style={{ marginLeft: "10px", padding: "4px 12px", background: "#34a853", color: "white", border: "none", borderRadius: "20px", cursor: "pointer", fontWeight: "bold" }}>
              Accept
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "12px", marginBottom: "12px",
  border: "1px solid #ddd", borderRadius: "8px",
  fontSize: "15px", boxSizing: "border-box"
};

const labelStyle = {
  display: "block", marginBottom: "8px",
  fontWeight: "bold", fontSize: "14px", color: "#333"
};

export default App;