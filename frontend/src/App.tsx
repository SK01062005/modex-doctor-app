import { useEffect, useState } from 'react';
import { api } from './api/client';

// --- Types ---
interface Slot {
  id: number;
  doctor_name: string;
  specialization: string;
  start_time: string;
  status: 'AVAILABLE' | 'BOOKED' | 'LOCKED';
}

// --- Helper: Get Doctor Image ---
// Since we don't have images in the DB yet, we assign them based on name/ID here.
const getDoctorImage = (name: string) => {
  if (name.includes('Sathish')) {
    return 'https://img.freepik.com/free-photo/portrait-smiling-handsome-male-doctor-man_171337-5055.jpg'; // Sample Male Doctor
  } else if (name.includes('Anjali')) {
    return 'https://img.freepik.com/free-photo/pleased-young-female-doctor-wearing-medical-robe-stethoscope-around-neck-standing-with-closed-posture_409827-254.jpg'; // Sample Female Doctor
  }
  return 'https://via.placeholder.com/150'; // Fallback
};

// --- Component: Loading Spinner ---
const Loader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column' }}>
    <div className="spinner" style={{
      width: '50px', height: '50px', border: '5px solid #f3f3f3',
      borderTop: '5px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite'
    }}></div>
    <p style={{ marginTop: '20px', color: '#666', fontFamily: 'sans-serif' }}>Finding available slots...</p>
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

function App() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  // Fetch Slots
  const fetchSlots = async () => {
    try {
      const response = await api.get('/slots');
      setSlots(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching slots:", error);
      setMsg("❌ Error connecting to backend.");
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlots(); }, []);

  // Handle Booking
  const handleBook = async (slotId: number) => {
    setMsg("⏳ Processing Booking...");
    try {
      await api.post('/book', { userId: 1, slotId });
      setMsg("✅ Booking Confirmed! Check your email.");
      fetchSlots();
    } catch (error: any) {
      setMsg(`❌ ${error.response?.data?.error || "Booking Failed"}`);
      fetchSlots();
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f2f5', 
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      padding: '40px 20px'
    }}>
      
      {/* Header Section */}
      <div style={{ maxWidth: '1000px', margin: '0 auto 40px', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '2.5rem', color: '#2c3e50', marginBottom: '10px',
          textShadow: '1px 1px 2px rgba(0,0,0,0.1)' 
        }}>
          🏥 Modex Health Care
        </h1>
        <p style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>
          Book your appointment with our top specialists instantly.
        </p>
      </div>

      {/* Message Banner */}
      {msg && <div style={{ 
        maxWidth: '600px', margin: '0 auto 30px', padding: '15px', borderRadius: '8px', 
        textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        backgroundColor: msg.includes('✅') ? '#d4edda' : msg.includes('⏳') ? '#fff3cd' : '#f8d7da',
        color: msg.includes('✅') ? '#155724' : msg.includes('⏳') ? '#856404' : '#721c24'
      }}>
        {msg}
      </div>}

      {/* Main Content */}
      {loading ? <Loader /> : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '30px', 
          maxWidth: '1000px', 
          margin: '0 auto' 
        }}>
          {slots.map((slot) => (
            <div key={slot.id} style={{ 
              backgroundColor: 'white', 
              borderRadius: '15px', 
              overflow: 'hidden',
              boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
              transition: 'transform 0.3s ease',
              opacity: slot.status === 'AVAILABLE' ? 1 : 0.6,
              border: slot.status === 'AVAILABLE' ? 'none' : '1px solid #ddd'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Doctor Image Header */}
              <div style={{ 
                height: '150px', 
                backgroundImage: `url(${getDoctorImage(slot.doctor_name)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'top center',
                position: 'relative'
              }}>
                <div style={{ 
                  position: 'absolute', bottom: 0, left: 0, right: 0, 
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', 
                  padding: '10px 20px'
                }}>
                  <h3 style={{ color: 'white', margin: 0 }}>{slot.doctor_name}</h3>
                  <span style={{ color: '#e0e0e0', fontSize: '0.9rem' }}>{slot.specialization}</span>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', color: '#555' }}>
                  <span style={{ fontSize: '1.2rem', marginRight: '10px' }}>📅</span>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#999' }}>Date & Time</div>
                    <div style={{ fontWeight: '600' }}>
                      {new Date(slot.start_time).toLocaleDateString()} at {new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleBook(slot.id)}
                  disabled={slot.status !== 'AVAILABLE'}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: slot.status === 'AVAILABLE' ? '#3498db' : '#95a5a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    cursor: slot.status === 'AVAILABLE' ? 'pointer' : 'not-allowed',
                    boxShadow: slot.status === 'AVAILABLE' ? '0 4px 6px rgba(52, 152, 219, 0.3)' : 'none'
                  }}
                >
                  {slot.status === 'AVAILABLE' ? 'Book Appointment' : 'Slot Taken'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;