"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const services = [
    {
        title: "Point of Sale",
        description: "Modern POS systems for retail and hospitality.",
        image: "/pos_system_interface_1767769386214.png",
        color: "from-blue-500/10 to-blue-500/5",
        hoverColor: "group-hover:text-blue-600",
        id: "pos"
    },
    {
        title: "Sales Dashboard",
        description: "Data-rich dashboards for performance tracking.",
        image: "/sales_dashboard_ui_1767769415198.png",
        color: "from-purple-500/10 to-purple-500/5",
        hoverColor: "group-hover:text-purple-600",
        id: "sales"
    },
    {
        title: "E-commerce",
        description: "Scalable online stores with seamless checkout.",
        image: "/ecommerce_platform_mockup_1767769431122.png",
        color: "from-pink-500/10 to-pink-500/5",
        hoverColor: "group-hover:text-pink-600",
        id: "ecommerce"
    },
    {
        title: "Customer CRM",
        description: "Comprehensive CRM for customer management.",
        image: "/customer_crm_interface_1767769445578.png",
        color: "from-teal-500/10 to-teal-500/5",
        hoverColor: "group-hover:text-teal-600",
        id: "crm"
    },
];

import { useRouter } from "next/navigation";

export function ServiceOptions() {
    const router = useRouter();

    const handleServiceClick = (serviceId: string) => {
        router.push(`/requirements-intake?service=${serviceId}`);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl mx-auto p-4">
            {services.map((service, index) => (
                <Card
                    key={index}
                    onClick={() => handleServiceClick(service.id)}
                    className="group overflow-hidden border-0 bg-white/50 backdrop-blur-sm shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                >
                    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300", service.color)} />
                    <CardContent className="p-0 relative h-full flex flex-col">
                        <div className="relative h-48 w-full overflow-hidden">
                            <Image
                                src={service.image}
                                alt={service.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-end bg-white/40">
                            <h3 className={cn("font-bold text-lg mb-1 transition-colors duration-200", service.hoverColor)}>
                                {service.title}
                            </h3>
                            <p className="text-sm text-slate-600/90 leading-relaxed">
                                {service.description}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
