import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Navbar from "./components/Navbar"; 
import Home from "./pages/Home";
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SubscriptionPlans from './pages/SubscriptionPlans';
import AdminDashboard from './pages/AdminDashboard';
import PlanManagement from './pages/PlanManagement';
import UserManagement from './pages/UserManagement';
import ForgotPassword from './pages/ForgotPassword';
import MergePdfPage from './pages/MergePdfPage';
import SplitPdfPage from "./pages/SplitPdfPage";
import RemovePdfPage from "./pages/RemovePdfPage";
import ExtractPdfPage from "./pages/ExtractPdfPage";
import RotatePdfPage from './pages/RotatePdfPage';
import CompressPdfPage from './pages/CompressPdfPage';
import JpgToPdfPage from './pages/JpgToPdfPage';
import WordToPdfPage from './pages/WordToPdfPage';
import PdfToJpgPage from './pages/PdfToJpgPage';
import Footer from './components/Footer';
import { Toaster } from 'react-hot-toast';
import AddPageNumbersPage from './pages/AddPageNumbersPage';
import { FaHashtag } from 'react-icons/fa';
import UnlockPdfPage from './pages/UnlockPdfPage';
import HtmlToPdfPage from './pages/HtmlToPdfPage';
import OrganizePdfPage from './pages/OrganizePdfPage';
import PptToPdfPage from "./pages/PptToPdf";
import ExcelToPdfPage from "./pages/ExcelToPdf";
import PdfToWordPage from "./pages/PdfToWord";
import PdfToPptPage from "./pages/PdfToPPT";
import PdfToExcelPage from "./pages/PdfToExcelPage";
import PdfToPdfaPage from "./pages/PdfToPdfA";
import PdfProtectionPage from "./pages/Protectedpdf";
import PdfComparePage from "./pages/CompareTwoPdf";
import PdfWatermarkPage from "./pages/WatermarkPdf";
import PdfRedactionPage from "./pages/PdfRedactionPage";
import PdfToTextPage from "./pages/PdfToText";
import UpdateMetadataPage from "./pages/UpdateMetaData";
import PdfMetadataViewer from "./pages/MetaDataViewer";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/signup" element={<Register />} />
              <Route path="/plans" element={<SubscriptionPlans />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              <Route path="/admin/plans" element={
                <AdminRoute>
                  <PlanManagement />
                </AdminRoute>
              } />
              <Route path="/admin/users" element={
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              } />

              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/merge-pdf" element={<MergePdfPage />} />
              <Route path="/split-pdf" element={<SplitPdfPage />} />
              <Route path="/remove-pages" element={<RemovePdfPage />} />
              <Route path="/extract-pages" element={<ExtractPdfPage />} />
              <Route path="/rotate-pdf" element={<RotatePdfPage />} />
              <Route path="/compress-pdf" element={<CompressPdfPage />} />
              <Route path="/jpg-to-pdf" element={<JpgToPdfPage />} />
              <Route path="/word-to-pdf" element={<WordToPdfPage />} />
              <Route path="/pdf-to-jpg" element={<PdfToJpgPage />} />
              <Route path="/add-page-numbers" element={<AddPageNumbersPage />} />
              <Route path="/unlock-pdf" element={<UnlockPdfPage />} />
              <Route path="/html-to-pdf" element={<HtmlToPdfPage />} />
              <Route path="/organize-pdf" element={<OrganizePdfPage />} />
              <Route path="/ppt-to-pdf" element={<PptToPdfPage />} />
              <Route path="/excel-to-pdf" element={<ExcelToPdfPage />} />
              <Route path="/pdf-to-word" element={<PdfToWordPage />} />
              <Route path="/pdf-to-ppt" element={<PdfToPptPage />} />
              <Route path="/pdf-to-excel" element={<PdfToExcelPage />} />
              <Route path="/pdf-to-pdfa" element={<PdfToPdfaPage />} />
              <Route path="/protect-pdf" element={<PdfProtectionPage />} />
              <Route path="/compare-pdf" element={<PdfComparePage />} />
              <Route path="/add-watermark" element={<PdfWatermarkPage />} />
              <Route path="/pdf-redaction" element={<PdfRedactionPage />} />
              <Route path="/pdf-to-text" element={<PdfToTextPage />} />
              <Route path="/update-metadata" element={<UpdateMetadataPage />} />
              <Route path="/view-metadata" element={<PdfMetadataViewer />} />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
