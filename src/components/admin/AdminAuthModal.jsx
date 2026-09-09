import React, { useState, useRef, useEffect } from 'react';
import Icons from '../common/Icons';
import CameraModal from '../common/CameraModal';
import supabase from '../../lib/supabase';
import {
  ADMIN_SECRETS,
  MODEL_URL,
  SUPER_ADMIN_EMAILS,
  SUPER_ADMIN_IMG
} from '../../config/constants';
import { useToast } from '../common/Toast';

export const AdminAuthModal = ({ onLoginSuccess, loginPolicy }) => {
  const [view, setView] = useState('login'); // 'login' | 'secret' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretInput, setSecretInput] = useState('');

  // Registration State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regDescriptors, setRegDescriptors] = useState([]);
  const [regStatus, setRegStatus] = useState('');

  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [scanText, setScanText] = useState('Initializing Camera...');
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  const { showToast } = useToast();

  useEffect(() => {
    // Load FaceAPI models on mount
    const loadFaceModels = async () => {
      try {
        if (window.faceapi) {
          await Promise.all([
            window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            window.faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
          ]);
          setIsModelsLoaded(true);
        }
      } catch (err) {
        console.error('FaceAPI load error:', err);
      }
    };
    loadFaceModels();
    return () => stopCamera();
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsCameraOpen(false);
  };

  // 1. Password Login
  const handlePasswordLogin = async () => {
    if (!email || !password) {
      return showToast('Please enter both email and password', 'error');
    }

    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .eq('password', password)
        .maybeSingle();

      if (error || !user) {
        // Check if super admin master key was typed
        if (SUPER_ADMIN_EMAILS.includes(email.trim().toLowerCase()) && ADMIN_SECRETS.includes(password)) {
          return completeLoginSuccess({
            name: 'Isara Dilnuka',
            email: email.trim().toLowerCase(),
            approved: true
          });
        }
        return showToast('Invalid email or password', 'error');
      }

      completeLoginSuccess(user);
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  // 2. Face ID Login
  const handleFaceLogin = async () => {
    if (!email) return showToast('Enter your admin email to verify face', 'error');
    if (!window.faceapi || !isModelsLoaded) {
      return showToast('Face recognition models are loading, please wait...', 'error');
    }

    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (error || !user) {
        return showToast('No account found with this email', 'error');
      }

      if (!user.face_descriptors || user.face_descriptors.length === 0) {
        return showToast('No Face ID registered for this user. Use password.', 'error');
      }

      // Convert descriptors
      const floatDescriptors = user.face_descriptors.map((d) => new Float32Array(d));
      const matcher = new window.faceapi.FaceMatcher(
        new window.faceapi.LabeledFaceDescriptors(user.email, floatDescriptors),
        0.5
      );

      startCameraVerification(matcher, user);
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  // Camera Verification Loop
  const startCameraVerification = async (matcher, user) => {
    setIsCameraOpen(true);
    setScanText('Position face to authenticate...');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          if (!video || !canvas) return;

          window.faceapi.matchDimensions(canvas, {
            width: video.videoWidth,
            height: video.videoHeight
          });

          scanIntervalRef.current = setInterval(async () => {
            const det = await window.faceapi
              .detectSingleFace(video, new window.faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withFaceDescriptor();

            if (det) {
              const match = matcher.findBestMatch(det.descriptor);
              if (match.label === user.email) {
                stopCamera();
                showToast('Biometric Match Confirmed!', 'success');
                completeLoginSuccess(user);
              } else {
                setScanText('Face not recognized. Keep looking at camera...');
              }
            } else {
              setScanText('Looking for face... Ensure good light.');
            }
          }, 500);
        };
      }
    } catch (e) {
      showToast('Camera error: ' + e.message, 'error');
      stopCamera();
    }
  };

  // Registration Face Scan
  const handleStartRegScan = async () => {
    if (!window.faceapi || !isModelsLoaded) {
      return showToast('Face recognition models are loading, please wait...', 'error');
    }

    setRegDescriptors([]);
    setIsCameraOpen(true);
    setScanText('Initializing camera for setup...');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          if (!video || !canvas) return;

          window.faceapi.matchDimensions(canvas, {
            width: video.videoWidth,
            height: video.videoHeight
          });

          let scanCount = 0;
          const captured = [];

          scanIntervalRef.current = setInterval(async () => {
            const det = await window.faceapi
              .detectSingleFace(video, new window.faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withFaceDescriptor();

            if (det) {
              scanCount++;
              captured.push(Array.from(det.descriptor));
              setScanText(`Scanning Face... ${scanCount * 20}%`);

              if (scanCount >= 5) {
                stopCamera();
                setRegDescriptors(captured);
                setRegStatus('Face Data Successfully Captured!');
                showToast('Biometric setup complete!', 'success');
              }
            } else {
              setScanText('Adjust position & lighting...');
            }
          }, 450);
        };
      }
    } catch (e) {
      showToast('Camera error: ' + e.message, 'error');
      stopCamera();
    }
  };

  const completeLoginSuccess = async (user) => {
    const isSuper = SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase());
    if (!user.approved && !isSuper) {
      return showToast('Account awaiting Super Admin approval.', 'error');
    }

    // Update last login
    if (user.id) {
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);
    }

    showToast(`Welcome back, ${user.name}!`, 'success');
    onLoginSuccess(user);
  };

  const handleVerifySecret = () => {
    if (ADMIN_SECRETS.includes(secretInput.trim())) {
      showToast('Master Key Verified! Proceed to register.', 'success');
      setView('register');
    } else {
      showToast('Invalid Master Key', 'error');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPass) {
      return showToast('Please fill all required fields', 'error');
    }

    try {
      const { error } = await supabase.from('users').insert({
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        phone: regPhone.trim(),
        password: regPass,
        face_descriptors: regDescriptors.length > 0 ? regDescriptors : null,
        approved: false,
        last_login: new Date().toISOString(),
        email_confirmed_at: null
      });

      if (error) throw error;

      showToast('Registration request sent! Please await approval.', 'success');
      setView('login');
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegPass('');
      setRegDescriptors([]);
      setRegStatus('');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate__animated animate__fadeIn">
        <div className="glass-panel w-full max-w-md p-8 rounded-3xl relative z-10 shadow-2xl border border-white/10 bg-[#0c101a]/90">
          {/* 1. LOGIN VIEW */}
          {view === 'login' && (
            <div className="animate__animated animate__fadeIn">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-tr from-emerald-400 to-emerald-700 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-5 rotate-3 hover:rotate-0 transition-all duration-300">
                  <i className="fas fa-user-shield text-4xl text-white"></i>
                </div>
                <h1 className="text-3xl font-heading font-bold text-white">
                  Admin Portal
                </h1>
                <p className="text-sm text-gray-400 mt-2">
                  Sign in to access DE Education administration
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-2 block tracking-wider">
                    Admin Email
                  </label>
                  <div className="relative">
                    <i className="fas fa-envelope absolute left-4 top-4 text-gray-500"></i>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-black/50 border border-white/10 focus:border-emerald-500 outline-none transition-all text-white placeholder-gray-600 text-sm"
                      placeholder="admin@deeducation.lk"
                    />
                  </div>
                </div>

                {/* Password field shown unless face-only is enforced */}
                {loginPolicy !== 'face' && (
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-2 block tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <i className="fas fa-lock absolute left-4 top-4 text-gray-500"></i>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handlePasswordLogin()}
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-black/50 border border-white/10 focus:border-emerald-500 outline-none transition-all text-white placeholder-gray-600 text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                )}

                {/* Login Action Buttons */}
                <div className="space-y-3 pt-2">
                  {loginPolicy !== 'face' && (
                    <button
                      onClick={handlePasswordLogin}
                      className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-3 text-base"
                    >
                      <span>Sign In with Password</span>
                      <Icons.ArrowRight size={16} />
                    </button>
                  )}

                  {loginPolicy !== 'password' && (
                    <button
                      onClick={handleFaceLogin}
                      className={`w-full py-3.5 rounded-2xl font-bold transition-all transform active:scale-95 flex items-center justify-center gap-3 text-sm ${
                        loginPolicy === 'face'
                          ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg'
                          : 'bg-white/5 hover:bg-white/10 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      <Icons.Camera size={18} />
                      <span>Face ID Verification</span>
                    </button>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/10 text-xs">
                  <span className="text-gray-500">Need admin access?</span>
                  <button
                    onClick={() => setView('secret')}
                    className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Enter Master Key
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. MASTER KEY VIEW */}
          {view === 'secret' && (
            <div className="animate__animated animate__fadeIn">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center justify-center mx-auto mb-4">
                  <Icons.Key size={30} />
                </div>
                <h2 className="text-2xl font-bold text-white">Security Verification</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Enter master security key to register a new administrator account.
                </p>
              </div>

              <div className="space-y-4">
                <input
                  type="password"
                  value={secretInput}
                  onChange={(e) => setSecretInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifySecret()}
                  className="w-full px-4 py-4 text-center tracking-[0.4em] text-2xl font-bold rounded-2xl bg-black/50 border border-white/10 focus:border-yellow-400 outline-none text-white transition-all"
                  placeholder="••••••••"
                  autoFocus
                />
                <button
                  onClick={handleVerifySecret}
                  className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-2xl shadow-lg shadow-yellow-500/20 transition-transform active:scale-95"
                >
                  Verify Key
                </button>
                <button
                  onClick={() => setView('login')}
                  className="w-full py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* 3. REGISTER VIEW */}
          {view === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="animate__animated animate__fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  <Icons.ArrowLeft size={16} />
                </button>
                <h2 className="text-xl font-bold text-white">Create Admin Account</h2>
              </div>

              <div className="space-y-3 text-sm">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white outline-none focus:border-emerald-500"
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white outline-none focus:border-emerald-500"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white outline-none focus:border-emerald-500"
                />
                <input
                  type="password"
                  placeholder="Create Password"
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white outline-none focus:border-emerald-500"
                  required
                />

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleStartRegScan}
                    className="w-full py-3 border-2 border-dashed border-emerald-500/40 text-emerald-400 rounded-xl font-bold text-xs hover:bg-emerald-500/10 transition-all flex items-center justify-center gap-2"
                  >
                    <Icons.Camera size={16} />
                    <span>Setup Face ID (Recommended)</span>
                  </button>
                  {regStatus && (
                    <p className="text-[11px] text-center text-emerald-400 font-bold mt-2">
                      {regStatus}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-all shadow-lg mt-4"
                >
                  Complete Registration
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Live Camera Scanner Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={stopCamera}
        scanText={scanText}
        videoRef={videoRef}
        canvasRef={canvasRef}
      />
    </>
  );
};

export default AdminAuthModal;
