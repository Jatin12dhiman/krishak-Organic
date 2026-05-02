import { motion } from "framer-motion";
import { Card, CardBody } from "@/components/ui/Card";
import { CheckCircle2, Palette, ShoppingCart, Sparkles } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: "Pick Your Favorites",
      description: "Browse our extensive collection and select your favorite snacks from various categories",
      icon: CheckCircle2,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      number: 2,
      title: "Customize Design",
      description: "Personalize your box with themes, messages, and branding options for any occasion",
      icon: Palette,
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      number: 3,
      title: "Checkout & Deliver",
      description: "Complete your order and get your custom snack box delivered to your doorstep",
      icon: ShoppingCart,
      color: "from-orange-500 to-saffron-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="mb-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="mb-4"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 flex items-center gap-x-2">
            <Sparkles className="text-saffron-600" size={24} />
            How It Works
          </h2>
        </motion.div>
        <p className="text-neutral-600 text-lg">
          Create your perfect snack box in three simple steps
        </p>
      </div>

      {/* Steps Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 gap-8 sm:grid-cols-3"
      >
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          
          return (
            <motion.div
              key={step.number}
              variants={itemVariants}
              className="relative"
              whileHover={{ scale: 1.03, y: -4 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <motion.div className="relative h-full neumorphic neumorphic-hover rounded-2xl overflow-hidden group p-8">
                {/* Background Icon with Low Opacity */}
                <motion.div 
                  className="absolute top-4 right-4 opacity-5"
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ 
                    duration: 8, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <IconComponent size={120} className={step.textColor} />
                </motion.div>
                
                <div className="relative z-10">
                  {/* Step Number with Icon Circle */}
                  <motion.div 
                    className={`inline-flex items-center justify-center w-16 h-16 ${step.bgColor} ${step.textColor} rounded-full font-bold text-xl mb-6 shadow-lg relative`}
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    animate={{
                      boxShadow: [
                        "0 4px 12px rgba(0, 0, 0, 0.1)",
                        "0 4px 20px rgba(0, 0, 0, 0.15)",
                        "0 4px 12px rgba(0, 0, 0, 0.1)"
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <span className="relative z-10">{step.number}</span>
                  </motion.div>

                  {/* Content with fade-in delay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                      {step.title}
                    </h3>
                    
                    <p className="text-neutral-600 text-base leading-relaxed">
                      {step.description}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}