"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactFormSchema } from "@/lib/validations";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button.jsx";
import Input from "@/components/ui/Input.jsx";
import { useAuth } from "@/app/AuthProvider.jsx";
import { Mail, Phone, MessageSquare, Send } from "lucide-react";

export default function ContactUsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phoneNumber || "",
      subject: "",
      message: "",
      queryType: "General",
    },
  });

  const queryType = watch("queryType");

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post("/contact", {
        name: data.name,
        email: data.email,
        phoneNumber: data.phone,
        subject: data.subject,
        message: data.message,
        queryType: data.queryType,
        userId: user?._id || null,
      });

      if (res.success) {
        toast.success(
          "Thank you for contacting us! We'll get back to you soon."
        );
        reset({
          name: user?.name || "",
          email: user?.email || "",
          phone: user?.phoneNumber || "",
          subject: "",
          message: "",
          queryType: "General",
        });
      } else {
        throw new Error(res.message || "Failed to submit contact form");
      }
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error(
        error.message || "Failed to submit contact form. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Have a question or feedback? We&apos;d love to hear from you! Fill
            out the form below and we&apos;ll get back to you as soon as
            possible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-1">
                  Email Us
                </h3>
                <p className="text-neutral-600">Send us an email anytime</p>
                <a
                  href="mailto:hello@krishakorganic.com"
                  className="text-green-600 hover:text-green-700 mt-1 inline-block"
                >
                  hello@krishakorganic.com
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-1">Call Us</h3>
                <p className="text-neutral-600">We&apos;re here to help</p>
                <a
                  href="tel:+917303888707"
                  className="text-green-600 hover:text-green-700 mt-1 inline-block"
                >
                  +91 730 388 8707
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-semibold text-neutral-900">
              Send us a Message
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Name *"
                type="text"
                placeholder="Your full name"
                {...register("name")}
                error={errors.name?.message}
              />

              <Input
                label="Email"
                type="email"
                placeholder="your.email@example.com"
                {...register("email")}
                error={errors.email?.message}
              />
            </div>

            <div>
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+91 730 388 8707"
                {...register("phone")}
                error={errors.phone?.message}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm text-neutral-700">
                  Query Type *
                </label>
                <select
                  className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 outline-none ring-0 transition focus:border-neutral-400"
                  {...register("queryType")}
                >
                  <option value="General">General Inquiry</option>
                  <option value="Franchise">Franchise</option>
                  <option value="Party Order">Party Order</option>
                  <option value="Corporate Order">Corporate Order</option>
                </select>
                {errors.queryType && (
                  <span className="mt-1 block text-sm text-red-600">
                    {errors.queryType.message}
                  </span>
                )}
              </div>

              <Input
                label="Subject *"
                type="text"
                placeholder="What is this regarding?"
                {...register("subject")}
                error={errors.subject?.message}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm text-neutral-700">
                Message *
              </label>
              <textarea
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 outline-none ring-0 transition focus:border-neutral-400 min-h-[150px] resize-y"
                placeholder="Tell us more about your inquiry..."
                {...register("message")}
              />
              {errors.message && (
                <span className="mt-1 block text-sm text-red-600">
                  {errors.message.message}
                </span>
              )}
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full md:w-auto"
              size="lg"
            >
              <Send className="w-4 h-4 mr-2 inline" />
              Send Message
            </Button>
          </form>
        </div>

        <div className="mt-8 text-center text-sm text-neutral-500">
          <p>We typically respond within 24-48 hours during business days.</p>
        </div>
      </div>
    </div>
  );
}
