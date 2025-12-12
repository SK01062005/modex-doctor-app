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

// --- Images ---
const getDoctorImage = (name: string) => {
  if (name.includes('Sathish')) return 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1470&auto=format&fit=crop';
  if (name.includes('Michael')) return 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=1470&auto=format&fit=crop';
  if (name.includes('Anjali')) return 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1470&auto=format&fit=crop';
  if (name.includes('Emily')) return 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=1374&auto=format&fit=crop';
  return 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1464&auto=format&fit=crop';
};

const triageSymptom = (text: string) => {
  const lower = text.toLowerCase();
  if (lower.includes('heart') || lower.includes('chest')) return 'Cardiology';
  if (lower.includes('skin') || lower.includes('rash')) return 'Dermatology';
  if (lower.includes('head')) return 'Neurology';
  return '';
};

// --- Loader Component ---
const Loader = () => (
  <div style={{ 
    position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', 
    justifyContent: 'center', alignItems: 'center', zIndex: 9999,
    backgroundImage: 'url("https://images.unsplash.com/photo-1504813184591-01572f98c85f?q=80&w=2071&auto=format&fit=crop")',
    backgroundSize: 'cover', backgroundPosition: 'center'
  }}>
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(2, 12, 27, 0.9)' }}></div>
    <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
      <div className="floating" style={{ fontSize: '80px', filter: 'drop-shadow(0 0 20px #64ffda)' }}>🧬</div>
      <h2 style={{ color: '#64ffda', marginTop: '20px', letterSpacing: '3px', fontFamily: 'monospace' }}>SYSTEM INITIALIZING...</h2>
      <div className="spinner" style={{
        width: '50px', height: '50px', border: '3px solid rgba(100, 255, 218, 0.3)',
        borderTop: '3px solid #64ffda', borderRadius: '50%', margin: '30px auto'
      }}></div>
    </div>
    <div className="creator-badge"><span>⚡ Created by Sathish</span></div>
  </div>
);

function App() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [filteredSlots, setFilteredSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [symptom, setSymptom] = useState('');
  const [insuranceVerified, setInsuranceVerified] = useState(false);

  // --- Modal State ---
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [formData, setFormData] = useState({ email: '', phone: '', whatsapp: '' });

  const fetchSlots = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const response = await api.get('/slots');
      setSlots(response.data);
      setFilteredSlots(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setMsg("❌ Connection Error.");
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

  // --- Step 1: Open Modal ---
  const initiateBooking = (slotId: number) => {
    setSelectedSlot(slotId);
    setShowModal(true);
  };

  // --- Step 2: Handle Final Submission ---
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(false); // Close modal
    
    if (selectedSlot === null) return;

    setMsg("⏳ Verifying Details & Securing Slot...");
    
    try {
      // Perform the actual booking
      await api.post('/book', { userId: 1, slotId: selectedSlot });
      
      // Show the Success Message requested
      setMsg("✅ Booking Successful! A representative will contact you shortly.");
      
      fetchSlots();
      setFormData({ email: '', phone: '', whatsapp: '' }); // Reset form
    } catch (error: any) {
      setMsg(`❌ ${error.response?.data?.error || "Booking Failed"}`);
      fetchSlots();
    }
  };

  if (loading) return <Loader />;

  return (
    <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* Backgrounds */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, backgroundImage: 'url("https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'opacity(0.4)' }}></div>
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, background: 'linear-gradient(to bottom, rgba(2, 12, 27, 0.8), rgba(2, 12, 27, 0.95))' }}></div>

      <div className="creator-badge floating"><span style={{ fontSize: '1.2rem' }}>👨‍💻</span><span>Created by Sathish</span></div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, color: '#e6f1ff', textShadow: '0 0 20px rgba(100, 255, 218, 0.3)' }}>MODEX <span style={{ color: '#64ffda' }}>NEURO</span></h1>
          <p style={{ color: '#8892b0', fontSize: '1.2rem' }}>Advanced AI-Driven Medical Triage System</p>
        </header>

        {/* Search */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '50px', justifyContent: 'center' }}>
          <input type="text" placeholder="Describe symptoms (e.g. 'headache')..." value={symptom} onChange={(e) => setSymptom(e.target.value)} style={{ padding: '15px 30px', borderRadius: '50px', border: '1px solid #233554', background: '#112240', color: 'white', width: '100%', maxWidth: '500px', outline: 'none' }} />
          <button onClick={() => setInsuranceVerified(!insuranceVerified)} style={{ background: insuranceVerified ? '#64ffda' : 'transparent', color: insuranceVerified ? '#020c1b' : '#64ffda', border: '1px solid #64ffda', borderRadius: '50px', padding: '0 25px', cursor: 'pointer', fontWeight: 'bold' }}>{insuranceVerified ? 'Shield Active' : 'Check Shield'}</button>
        </div>

        {/* Message Banner */}
        {msg && <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 2000, padding: '15px 30px', borderRadius: '30px', background: msg.includes('✅') ? '#64ffda' : '#ff6b6b', color: '#020c1b', fontWeight: 'bold', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', textAlign: 'center', width: 'max-content' }}>{msg}</div>}

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
          {filteredSlots.map((slot) => (
            <div key={slot.id} style={{ background: '#112240', borderRadius: '15px', overflow: 'hidden', border: '1px solid rgba(100, 255, 218, 0.05)', opacity: slot.status === 'AVAILABLE' ? 1 : 0.6 }}>
              <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                <img src={getDoctorImage(slot.doctor_name)} alt="Doc" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, #112240)', height: '100px' }}></div>
              </div>
              <div style={{ padding: '25px', position: 'relative' }}>
                <span style={{ color: '#64ffda', fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase' }}>{slot.specialization}</span>
                <h2 style={{ margin: '5px 0 15px', color: '#e6f1ff' }}>{slot.doctor_name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#8892b0' }}>
                  <span>📅 {new Date(slot.start_time).toLocaleDateString()}</span>
                  <span style={{ color: '#64ffda' }}>{new Date(slot.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                </div>
                <button 
                  onClick={() => initiateBooking(slot.id)}
                  disabled={slot.status !== 'AVAILABLE'}
                  className={slot.status === 'AVAILABLE' ? 'pulse-button' : ''}
                  style={{ width: '100%', padding: '15px', borderRadius: '8px', border: 'none', background: slot.status === 'AVAILABLE' ? '#64ffda' : '#233554', color: slot.status === 'AVAILABLE' ? '#0a192f' : '#8892b0', fontWeight: 'bold', cursor: slot.status === 'AVAILABLE' ? 'pointer' : 'not-allowed', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {slot.status === 'AVAILABLE' ? 'Schedule Consult' : 'Locked'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* --- POPUP MODAL --- */}
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(2, 12, 27, 0.85)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 5000 }}>
            <div style={{ background: '#112240', padding: '40px', borderRadius: '20px', width: '90%', maxWidth: '450px', border: '1px solid #64ffda', boxShadow: '0 0 40px rgba(100, 255, 218, 0.1)', position: 'relative' }}>
              <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#8892b0', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
              
              <h2 style={{ color: '#e6f1ff', marginTop: 0, textAlign: 'center' }}>Patient Intake Form</h2>
              <p style={{ color: '#8892b0', textAlign: 'center', marginBottom: '30px', fontSize: '0.9rem' }}>Please provide contact details for the consultation.</p>
              
              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input required type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #233554', background: '#0a192f', color: 'white', outline: 'none' }} />
                <input required type="tel" placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #233554', background: '#0a192f', color: 'white', outline: 'none' }} />
                <input required type="tel" placeholder="WhatsApp Number" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #233554', background: '#0a192f', color: 'white', outline: 'none' }} />
                
                <div style={{ background: 'rgba(100, 255, 218, 0.1)', padding: '10px', borderRadius: '8px', marginTop: '10px' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64ffda', textAlign: 'center' }}>ℹ️ A representative will call you on these numbers to confirm details.</p>
                </div>

                <button type="submit" style={{ marginTop: '10px', padding: '15px', background: '#64ffda', color: '#020c1b', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', textTransform: 'uppercase' }}>
                  Confirm Request
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;