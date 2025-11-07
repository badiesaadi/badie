import React, { useState } from 'react';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input'; // Removed Textarea as unused
import { MessageSquare, HelpCircle, Bot, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'How do I book an appointment?',
    answer: 'Clients can book appointments from the "Appointments" section by selecting a facility, doctor, date, and time. Ensure you fill in the reason for your visit.',
  },
  {
    question: 'What if I forget my password?',
    answer: 'On the login page, click "Forgot your password?" and follow the instructions to reset it using your registered email address.',
  },
  {
    question: 'How do doctors update appointment statuses?',
    answer: 'Doctors can view their scheduled appointments in the "Appointments" section of their dashboard. They can approve, cancel, or mark appointments as finished.',
  },
  {
    question: 'Can I view my medical history?',
    answer: 'Yes, clients can access their full medical history, including past diagnoses, notes, and prescriptions, from the "Medical Records" section.',
  },
  {
    question: 'How do I add a new facility (Ministry officials)?',
    answer: 'Ministry officials (General Admins) can add new facilities via the "Facilities" section on their dashboard. Click "Add New Facility" and fill in the required details.',
  },
  {
    question: 'Where can I see national healthcare statistics?',
    answer: 'Ministry officials have access to the "Reports & Analytics" section, which provides national dashboards, bed occupancy trends, and facility activity per region.',
  },
];

interface ChatMessage {
  id: number;
  sender: 'user' | 'bot';
  text: string;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() === '') return;

    const newUserMessage: ChatMessage = { id: Date.now(), sender: 'user', text: input.trim() };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(input.trim());
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'bot', text: botResponse }]);
    }, 1000);
  };

  const generateBotResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
      return 'Hello! How can I assist you with the National Connected Healthcare Platform?';
    }
    if (lowerQuery.includes('appointment')) {
      return 'To book an appointment, navigate to the "Appointments" page. If you are a doctor, you can manage your appointments there.';
    }
    if (lowerQuery.includes('medical record') || lowerQuery.includes('history')) {
      return 'Clients can view their medical history in the "Medical Records" section. Doctors can add new records after appointments.';
    }
    if (lowerQuery.includes('password reset')) {
      return 'If you forgot your password, use the "Forgot your password?" link on the login page.';
    }
    if (lowerQuery.includes('contact support')) {
      return 'For further assistance, please contact your system administrator or refer to the comprehensive user manual.';
    }
    if (lowerQuery.includes('thank you') || lowerQuery.includes('thanks')) {
        return 'You\'re welcome! Is there anything else I can help you with?';
    }
    if (lowerQuery.includes('facilities')) {
        return 'The "Facilities" page allows General Admins to manage healthcare facilities and assign doctors. Other roles can view a list of facilities.';
    }
    if (lowerQuery.includes('reports') || lowerQuery.includes('analytics')) {
        return 'Reports and Analytics are available for Admin and General Admin roles, providing insights into various healthcare metrics.';
    }

    return "I'm sorry, I don't understand that request. Please try rephrasing or check the FAQ section.";
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            className="bg-card rounded-lg shadow-xl w-80 h-[400px] flex flex-col border border-gray-200"
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-primary text-white rounded-t-lg">
              <h3 className="font-semibold flex items-center"><Bot size={18} className="mr-2" /> NCHP Chatbot</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsChatOpen(false)} className="text-white hover:text-gray-200 p-1" icon={XCircle} aria-label="Close Chatbot" />
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 text-sm mt-8">
                  Type 'Hello' to start a conversation!
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-2 rounded-lg text-sm ${
                      msg.sender === 'user' ? 'bg-primary text-white' : 'bg-gray-200 text-text'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 flex">
              <Input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 !mb-0 !p-2 !text-sm"
              />
              <Button type="submit" size="sm" className="ml-2">
                Send
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      {!isChatOpen && (
        <Button
          onClick={() => setIsChatOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg animate-bounce"
          icon={MessageSquare}
          size="lg"
          aria-label="Open Chatbot"
        />
      )}
    </div>
  );
};

export const HelpCenterPage: React.FC = () => {
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  return (
    <DashboardLayout title="Help Center">
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <Card title="Frequently Asked Questions">
            {faqs.map((faq, index) => (
              <div key={index} className="mb-4 last:mb-0 border-b border-gray-200 pb-4">
                <button
                  className="flex justify-between items-center w-full text-left font-semibold text-lg text-text hover:text-primary"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={activeFAQ === index}
                >
                  {faq.question}
                  <HelpCircle size={20} className={`transform transition-transform ${activeFAQ === index ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeFAQ === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-2 text-gray-700">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <Card title="Prevention Tips">
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Regular hand washing is crucial to prevent the spread of germs.</li>
              <li>Maintain a balanced diet rich in fruits, vegetables, and whole grains.</li>
              <li>Engage in at least 30 minutes of moderate exercise most days of the week.</li>
              <li>Ensure you get 7-9 hours of quality sleep per night.</li>
              <li>Stay up-to-date with recommended vaccinations.</li>
              <li>Schedule regular check-ups with your doctor for preventive care.</li>
            </ul>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>
          <Card title="Staff Support Articles">
            <p className="text-gray-700">
              Access the internal knowledge base for detailed articles on system usage,
              troubleshooting guides, and best practices for patient care.
              <a href="#" className="text-primary hover:underline ml-1">Go to Internal KB</a>.
            </p>
          </Card>
        </motion.div>
      </div>
      <Chatbot />
    </DashboardLayout>
  );
};