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
// Uses reliable randomuser.me portraits based on the name to ensure consistency
const getDoctorImage = (name: string) => {
  if (name.includes('Sathish')) return 'https://randomuser.me/api/portraits/men/32.jpg';
  if (name.includes('Michael')) return 'https://randomuser.me/api/portraits/men/11.jpg';
  if (name.includes('Anjali')) return 'https://randomuser.me/api/portraits/women/24.jpg';
  if (name.includes('Emily')) return 'https://randomuser.me/api/portraits/women/44.jpg';
  if (name.includes('Sarah')) return 'https://randomuser.me/api/portraits/women/68.jpg';
  
  // Fallback for any other names
  return 'https://randomuser.me/api/portraits/legos/1.jpg';
};

// --- Component: Loading Spinner ---
const Loader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column' }}>
    <div className="spinner" style={{
      width: '60px', height: '60px', border: '6px solid #f3f3f3',
      borderTop: '6px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite'
    }}></div>
    <h3 style={{ marginTop: '20px', color: '#555', fontFamily: 'sans-serif' }}>Finding available specialists...</h3>
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

function App() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  // Fetch Slots from Backend
  const fetchSlots = async () => {
    try {
      const response = await api.get('/slots');
      setSlots(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching slots:", error);
      setMsg("❌ Error connecting to backend. Please wait a moment and refresh.");
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlots(); }, []);

  // Handle Booking Transaction
  const handleBook = async (slotId: number) => {
    setMsg("⏳ Processing secure booking...");
    
    try {
      // Hardcoded user for demo purposes
      await api.post('/book', { userId: 1, slotId });
      setMsg("✅ Booking Confirmed! Your appointment is locked.");
      fetchSlots(); // Refresh data to show 'BOOKED' status
    } catch (error: any) {
      const errorText = error.response?.data?.error || "Booking Failed";
      setMsg(`❌ ${errorText}`);
      fetchSlots(); // Refresh data in case someone else took it
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f4f7f6', 
      fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      padding: '40px 20px'
    }}>
      
      {/* Header Section */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 50px', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '3rem', color: '#2c3e50', marginBottom: '10px', fontWeight: '800',
          letterSpacing: '-1px'
        }}>
          🏥 Modex Health Care
        </h1>
        <p style={{ color: '#7f8c8d', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Select a specialist below to book your instant appointment.
        </p>
      </div>

      {/* Message Banner (Floating) */}
      {msg && <div style={{ 
        position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 1000, padding: '15px 30px', borderRadius: '50px', 
        fontWeight: 'bold', boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        backgroundColor: msg.includes('✅') ? '#2ecc71' : msg.includes('⏳') ? '#f1c40f' : '#e74c3c',
        color: 'white', fontSize: '1.1rem', transition: 'all 0.3s ease'
      }}>
        {msg}
      </div>}

      {/* Main Grid Content */}
      {loading ? <Loader /> : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '40px', 
          maxWidth: '1200px', 
          margin: '0 auto' 
        }}>
          {slots.map((slot) => (
            <div key={slot.id} style={{ 
              backgroundColor: 'white', 
              borderRadius: '20px', 
              overflow: 'hidden',
              boxShadow: '0 15px 35px rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease',
              opacity: slot.status === 'AVAILABLE' ? 1 : 0.6,
              transform: 'scale(1)',
              filter: slot.status === 'AVAILABLE' ? 'none' : 'grayscale(100%)'
            }}
            onMouseEnter={(e) => { if(slot.status === 'AVAILABLE') e.currentTarget.style.transform = 'translateY(-10px)' }}
            onMouseLeave={(e) => { if(slot.status === 'AVAILABLE') e.currentTarget.style.transform = 'translateY(0)' }}
            >
              
              {/* Doctor Image Header with Gradient Overlay */}
              <div style={{ 
                height: '200px', 
                backgroundImage: `url(${getDoctorImage(slot.doctor_name)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center top',
                position: 'relative'
              }}>
                <div style={{ 
                  position: 'absolute', bottom: 0, left: 0, right: 0, 
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', 
                  padding: '20px', paddingTop: '60px'
                }}>
                  <h2 style={{ color: 'white', margin: 0, fontSize: '1.4rem' }}>{slot.doctor_name}</h2>
                  <span style={{ 
                    color: '#fff', fontSize: '0.85rem', textTransform: 'uppercase', 
                    letterSpacing: '1px', opacity: 0.9, backgroundColor: '#3498db',
                    padding: '2px 8px', borderRadius: '4px', marginLeft: '0px'
                  }}>
                    {slot.specialization}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '25px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', color: '#555' }}>
                  <div style={{ 
                    backgroundColor: '#eef2f7', padding: '10px', borderRadius: '10px', marginRight: '15px'
                  }}>
                    📅
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#999', textTransform: 'uppercase', fontWeight: 'bold' }}>Appointment Time</div>
                    <div style={{ fontWeight: '600', color: '#333', fontSize: '1.1rem' }}>
                      {new Date(slot.start_time).toLocaleDateString()} 
                      <br />
                      <span style={{ color: '#3498db' }}>
                        {new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleBook(slot.id)}
                  disabled={slot.status !== 'AVAILABLE'}
                  style={{
                    width: '100%',
                    padding: '15px',
                    backgroundColor: slot.status === 'AVAILABLE' ? '#2c3e50' : '#bdc3c7',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    cursor: slot.status === 'AVAILABLE' ? 'pointer' : 'default',
                    transition: 'background 0.2s',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
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