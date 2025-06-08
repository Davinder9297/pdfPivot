import { useState, useEffect } from 'react';
import axios from 'axios';

const AVAILABLE_SERVICES = [
  'optimize-compress',
  'optimize-upscale',
  'optimize-remove-background',
  'create-meme',
  'modify-resize',
  'modify-crop',
  'modify-rotate',
  'convert-to-jpg',
  'convert-from-jpg',
  'convert-html-to-image',
  'security-watermark',
  'security-blur-face'
];

const PlanManagement = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    monthlyFee: '',
    annualFee: '',
    features: ['All services included'],
    services: AVAILABLE_SERVICES.map(service => ({
      name: service,
      monthlyQuota: 0,
      annualQuota: 0
    }))
  });
  const [bulkQuota, setBulkQuota] = useState({ monthly: '', annual: '' });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get('/api/subscriptions/plans');
      setPlans(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch plans');
      setLoading(false);
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      monthlyFee: plan.monthlyFee,
      annualFee: plan.annualFee,
      features: plan.features,
      services: AVAILABLE_SERVICES.map(service => {
        const existingService = plan.services.find(s => s.name === service);
        return {
          name: service,
          monthlyQuota: existingService?.monthlyQuota || 0,
          annualQuota: existingService?.annualQuota || 0
        };
      })
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const features = formData.features.length > 0 ? formData.features : ['All services included'];
      
      const dataToSend = {
        ...formData,
        features,
        monthlyFee: Number(formData.monthlyFee),
        annualFee: Number(formData.annualFee),
        services: formData.services.map(service => ({
          ...service,
          monthlyQuota: Number(service.monthlyQuota),
          annualQuota: Number(service.annualQuota)
        }))
      };

      if (editingPlan) {
        await axios.put(`/api/subscriptions/plans/${editingPlan._id}`, dataToSend);
      } else {
        await axios.post('/api/subscriptions/plans', dataToSend);
      }
      fetchPlans();
      setEditingPlan(null);
      setFormData({
        name: '',
        monthlyFee: '',
        annualFee: '',
        features: ['All services included'],
        services: AVAILABLE_SERVICES.map(service => ({
          name: service,
          monthlyQuota: 0,
          annualQuota: 0
        }))
      });
    } catch (err) {
      setError('Failed to save plan');
      console.error('Error details:', err.response?.data);
    }
  };

  const handleDelete = async (planId) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await axios.delete(`/api/subscriptions/plans/${planId}`);
        fetchPlans();
      } catch (err) {
        setError('Failed to delete plan');
      }
    }
  };

  const handleBulkQuotaChange = (type, value) => {
    setBulkQuota(prev => ({ ...prev, [type]: value }));
    const numValue = Number(value) || 0;
    setFormData(prev => ({
      ...prev,
      services: prev.services.map(service => ({
        ...service,
        [type === 'monthly' ? 'monthlyQuota' : 'annualQuota']: numValue
      }))
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Plan Management</h1>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mb-8">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="monthlyFee" className="block text-sm font-medium text-gray-700">
                        Monthly Fee
                      </label>
                      <input
                        type="number"
                        id="monthlyFee"
                        value={formData.monthlyFee}
                        onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="annualFee" className="block text-sm font-medium text-gray-700">
                        Annual Fee
                      </label>
                      <input
                        type="number"
                        id="annualFee"
                        value={formData.annualFee}
                        onChange={(e) => setFormData({ ...formData, annualFee: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Quotas</label>
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-3">Set All Service Quotas</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="bulk-monthly" className="block text-sm font-medium text-gray-700">
                            Monthly Quota (All Services)
                          </label>
                          <input
                            type="number"
                            id="bulk-monthly"
                            value={bulkQuota.monthly}
                            onChange={(e) => handleBulkQuotaChange('monthly', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Set monthly quota for all services"
                          />
                        </div>
                        <div>
                          <label htmlFor="bulk-annual" className="block text-sm font-medium text-gray-700">
                            Annual Quota (All Services)
                          </label>
                          <input
                            type="number"
                            id="bulk-annual"
                            value={bulkQuota.annual}
                            onChange={(e) => handleBulkQuotaChange('annual', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Set annual quota for all services"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Individual Service Quotas</h4>
                      <div className="grid grid-cols-1 gap-4">
                        {formData.services.map((service, index) => (
                          <div key={service.name} className="border rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-3">{service.name}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label htmlFor={`${service.name}-monthly`} className="block text-sm font-medium text-gray-700">
                                  Monthly Quota
                                </label>
                                <input
                                  type="number"
                                  id={`${service.name}-monthly`}
                                  value={service.monthlyQuota}
                                  onChange={(e) => {
                                    const newServices = [...formData.services];
                                    newServices[index] = {
                                      ...service,
                                      monthlyQuota: e.target.value
                                    };
                                    setFormData({
                                      ...formData,
                                      services: newServices
                                    });
                                  }}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                  required
                                />
                              </div>
                              <div>
                                <label htmlFor={`${service.name}-annual`} className="block text-sm font-medium text-gray-700">
                                  Annual Quota
                                </label>
                                <input
                                  type="number"
                                  id={`${service.name}-annual`}
                                  value={service.annualQuota}
                                  onChange={(e) => {
                                    const newServices = [...formData.services];
                                    newServices[index] = {
                                      ...service,
                                      annualQuota: e.target.value
                                    };
                                    setFormData({
                                      ...formData,
                                      services: newServices
                                    });
                                  }}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {editingPlan ? 'Update Plan' : 'Create Plan'}
                  </button>
                  {editingPlan && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPlan(null);
                        setFormData({
                          name: '',
                          monthlyFee: '',
                          annualFee: '',
                          features: ['All services included'],
                          services: AVAILABLE_SERVICES.map(service => ({
                            name: service,
                            monthlyQuota: 0,
                            annualQuota: 0
                          }))
                        });
                      }}
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="mt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Existing Plans</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {plans.map((plan) => (
                    <div key={plan._id} className="bg-white border rounded-lg shadow-sm p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
                          <p className="text-sm text-gray-500">
                            Monthly: ${plan.monthlyFee} | Annual: ${plan.annualFee}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(plan)}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(plan._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-gray-700">Features:</h4>
                        <ul className="mt-1 text-sm text-gray-500">
                          {plan.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-gray-700">Service Quotas:</h4>
                        <div className="mt-1 space-y-1">
                          {plan.services.map((service) => (
                            <div key={service.name} className="text-sm text-gray-500">
                              <span className="font-medium">{service.name}:</span> {service.monthlyQuota}/month, {service.annualQuota}/year
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanManagement; 