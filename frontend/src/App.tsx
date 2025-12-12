import React, { useEffect, useState } from 'react';
import { api } from './api/client';

// --- Types ---
interface Slot {
  id: number;
  doctor_name: string;
  specialization: string;
  start_time: string;
  status: 'AVAILABLE' | 'BOOKED' | 'LOCKED';
}

// --- Helpers ---
const getDoctorImage = (name: string) => {
  // Professional, high-quality portraits
  if (name.includes('Sathish')) return 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1464&auto=format&fit=crop';
  if (name.includes('Michael')) return 'https://images.unsplash.com/photo-1550831107-1553da8c8464?q=80&w=1470&auto=format&fit=crop';
  if (name.includes('Anjali')) return 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=1374&auto=format&fit=crop';
  if (name.includes('Emily')) return 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=1470&auto=format&fit=crop';
  return 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1480&auto=format&fit=crop';
};

const triageSymptom = (text: string) => {
  const lower = text.toLowerCase();
  if (lower.includes('heart') || lower.includes('chest')) return 'Cardiology';
  if (lower.includes('skin') || lower.includes('rash')) return 'Dermatology';
  if (lower.includes('head') || lower.includes('brain')) return 'Neurology';
  if (lower.includes('bone') || lower.includes('joint')) return 'Orthopedics';
  return '';
};

// --- Loader Component ---
const Loader = () => (
  <div style={{ 
    position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', 
    justifyContent: 'center', alignItems: 'center', zIndex: 9999,
    backgroundColor: 'var(--color-bg-main)'
  }}>
    <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
      <div className="heartbeat" style={{ fontSize: '80px', filter: 'drop-shadow(0 0 10px var(--color-accent))' }}>🧠</div>
      <h2 style={{ color: 'var(--color-text-primary)', marginTop: '20px', fontWeight: 300, letterSpacing: '2px' }}>INITIALIZING NEURO-CORE...</h2>
      <div className="spinner" style={{
        width: '40px', height: '40px', border: '3px solid var(--color-bg-card)',
        borderTop: '3px solid var(--color-accent)', borderRadius: '50%', margin: '30px auto'
      }}></div>
    </div>
  </div>
);

function App() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [filteredSlots, setFilteredSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [symptom, setSymptom] = useState('');
  const [insuranceVerified, setInsuranceVerified] = useState(false);

  const fetchSlots = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2500)); // Extended for dramatic effect
      const response = await api.get('/slots');
      setSlots(response.data);
      setFilteredSlots(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setMsg("❌ Secure Connection Failed.");
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlots(); }, []);

  useEffect(() => {
    if (!symptom) { setFilteredSlots(slots); return; }
    const specialty = triageSymptom(symptom);
    if (specialty) {
      setFilteredSlots(slots.filter(s => s.specialization.includes(specialty)));
    } else {
      setFilteredSlots(slots.filter(s => s.doctor_name.toLowerCase().includes(symptom.toLowerCase())));
    }
  }, [symptom, slots]);

  const handleBook = async (slotId: number) => {
    setMsg("⏳ Encrypting & Securing Appointment...");
    try {
      await api.post('/book', { userId: 1, slotId });
      setMsg("✅ Appointment Confirmed. Awaiting Patient.");
      fetchSlots();
    } catch (error: any) {
      setMsg(`❌ ${error.response?.data?.error || "Booking Failed"}`);
      fetchSlots();
    }
  };

  if (loading) return <Loader />;

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Main Background Image with Overlay */}
      <div style={{ 
        position: 'fixed', inset: 0, zIndex: -1,
        backgroundImage: 'url("https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2070&auto=format&fit=crop")', // Operating room / Neuro theme
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'brightness(0.4) saturate(1.2)'
      }}></div>
      <div style={{ 
        position: 'fixed', inset: 0, zIndex: -1,
        background: 'linear-gradient(to bottom, rgba(10, 25, 47, 0.9), rgba(10, 25, 47, 1))' 
      }}></div>

      <div className="slide-up" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* Hero Header */}
        <header style={{ textAlign: 'center', marginBottom: '60px', paddingTop: '40px' }}>
          <h1 style={{ 
            fontSize: '4rem', fontWeight: 900, letterSpacing: '1px', lineHeight: 1.1,
            background: 'linear-gradient(to right, var(--color-text-primary), var(--color-accent))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase', marginBottom: '20px'
          }}>
            Modex Neuro &<br />Specialty Clinic
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.3rem', maxWidth: '700px', margin: '0 auto' }}>
            Advanced precision medicine. Dedicated to the complex art of human healing.
          </p>
        </header>

        {/* Fake About Section */}
        <section style={{ 
          background: 'rgba(17, 34, 64, 0.8)', padding: '40px', borderRadius: '16px',
          marginBottom: '60px', border: '1px solid rgba(100, 255, 218, 0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{ color: 'var(--color-accent)', fontSize: '1.8rem', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Our Philosophy</h2>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '1.1rem' }}>
            Neurosurgery demands technique, patience, and a profound knowledge of the human mind. Each procedure is performed with extreme precision to ensure the best recovery. We celebrate the neurosurgeons who dedicate their lives to this art. Our clinic brings together world-class specialists across all disciplines to provide integrated, cutting-edge care.
          </p>
        </section>

        {/* Search & Filter Bar */}
        <div style={{ 
          display: 'flex', gap: '20px', marginBottom: '50px', flexWrap: 'wrap',
          background: 'var(--color-bg-card)', padding: '20px', borderRadius: '100px',
          border: '1px solid rgba(100, 255, 218, 0.2)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input 
              type="text" 
              placeholder="AI Symptom Triage (e.g., 'severe headache')..." 
              value={symptom} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSymptom(e.target.value)}
              style={{ 
                width: '100%', padding: '15px 25px', borderRadius: '50px', border: 'none', 
                fontSize: '1.1rem', background: 'transparent', color: 'var(--color-text-primary)',
                outline: 'none'
              }}
            />
            <span style={{ position: 'absolute', right: '25px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.5rem', opacity: 0.7 }}>🔍</span>
          </div>
          <button onClick={() => setInsuranceVerified(!insuranceVerified)} style={{ 
            background: insuranceVerified ? 'var(--color-accent)' : 'transparent', color: insuranceVerified ? 'var(--color-bg-main)' : 'var(--color-accent)', 
            border: '1px solid var(--color-accent)', padding: '0 30px', borderRadius: '50px', 
            cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', whiteSpace: 'nowrap', transition: 'all 0.3s'
          }}>
            {insuranceVerified ? '🛡️ Verified' : '🛡️ Check Cover'}
          </button>
        </div>

        {/* Message Banner */}
        {msg && <div style={{ 
          position: 'fixed', top: '30px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, 
          padding: '15px 40px', borderRadius: '50px', fontWeight: 'bold', 
          backgroundColor: msg.includes('✅') ? 'var(--color-accent)' : msg.includes('⏳') ? '#e67e22' : 'var(--color-danger)',
          color: msg.includes('✅') ? 'var(--color-bg-main)' : 'white',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)', letterSpacing: '1px'
        }}>{msg}</div>}

        {/* Doctor Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px', paddingBottom: '60px' }}>
          {filteredSlots.map((slot, index) => (
            <div key={slot.id} className="slide-up" style={{ 
              animationDelay: `${index * 0.1}s`,
              backgroundColor: 'var(--color-bg-card)', borderRadius: '16px', overflow: 'hidden',
              border: '1px solid rgba(100, 255, 218, 0.1)',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              opacity: slot.status === 'AVAILABLE' ? 1 : 0.5,
              filter: slot.status === 'AVAILABLE' ? 'none' : 'grayscale(100%) blur(1px)',
              transform: 'scale(1)'
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { if(slot.status==='AVAILABLE') { e.currentTarget.style.transform = 'translateY(-15px) scale(1.03)'; e.currentTarget.style.boxShadow = '0 20px 40px -15px rgba(100, 255, 218, 0.3)'; } }}
            onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { if(slot.status==='AVAILABLE') { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = 'none'; } }}
            >
              <div style={{ position: 'relative', height: '240px' }}>
                <img src={getDoctorImage(slot.doctor_name)} alt="Doctor" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--color-bg-card), transparent 80%)' }}></div>
                <div style={{ position: 'absolute', bottom: '20px', left: '20px' }}>
                  <span style={{ color: 'var(--color-accent)', fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>{slot.specialization}</span>
                  <h2 style={{ color: 'var(--color-text-primary)', margin: '5px 0 0', fontSize: '1.6rem' }}>{slot.doctor_name}</h2>
                </div>
              </div>

              <div style={{ padding: '25px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '25px' }}>
                  <div style={{ background: 'rgba(100, 255, 218, 0.1)', padding: '12px', borderRadius: '50%', marginRight: '15px' }}>📅</div>
                  <div>
                    <div style={{ color: 'var(--color-text-primary)', fontWeight: '600', fontSize: '1.1rem' }}>
                      {new Date(slot.start_time).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}
                    </div>
                    <div style={{ color: 'var(--color-accent)', fontSize: '1.1rem' }}>
                      {new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleBook(slot.id)}
                  disabled={slot.status !== 'AVAILABLE'}
                  className={slot.status === 'AVAILABLE' ? 'pulse-button' : ''}
                  style={{
                    width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
                    background: slot.status === 'AVAILABLE' ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.1)',
                    color: slot.status === 'AVAILABLE' ? 'var(--color-bg-main)' : 'var(--color-text-secondary)',
                    fontWeight: '900', fontSize: '1rem', cursor: slot.status === 'AVAILABLE' ? 'pointer' : 'not-allowed',
                    textTransform: 'uppercase', letterSpacing: '1.5px', transition: 'all 0.3s'
                  }}
                >
                  {slot.status === 'AVAILABLE' ? 'Schedule Consult' : 'Unavailable'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer / Contact Section */}
        <footer style={{ 
          textAlign: 'center', padding: '40px 0', borderTop: '1px solid rgba(100, 255, 218, 0.1)',
          color: 'var(--color-text-secondary)', fontSize: '0.9rem'
        }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '30px', fontSize: '1.2rem' }}>
            <span style={{ cursor: 'pointer', color: 'var(--color-accent)' }}>📞 +1 (555) 000-0000</span>
            <span style={{ cursor: 'pointer', color: 'var(--color-accent)' }}>🌐 www.modexneuro.com</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px', fontSize: '1.5rem' }}>
            <span>🏥</span><span>🧠</span><span>🔬</span>
          </div>
          <p>© 2025 Modex Neuro & Specialty Clinic. Excellence in every procedure.</p>
        </footer>

      </div>
    </div>
  );
}

export default App;