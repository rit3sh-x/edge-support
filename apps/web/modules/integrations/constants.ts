const DELIVERY_SOURCE = process.env.NEXT_PUBLIC_DELIVERY_SOURCE!;

export const INTEGRATIONS = [
    {
        id: "html",
        title: "HTML",
        icon: "/languages/html5.svg",
        script: `<script src="${DELIVERY_SOURCE}" data-organization-id="{{ORGANIZATION_ID}}"></script>`
    },
    {
        id: "react",
        title: "React",
        icon: "/languages/react.svg",
        script: `<script src="${DELIVERY_SOURCE}" data-organization-id="{{ORGANIZATION_ID}}"></script>`
    },
    {
        id: "nextjs",
        title: "NextJS",
        icon: "/languages/nextjs.svg",
        script: `<script src="${DELIVERY_SOURCE}" data-organization-id="{{ORGANIZATION_ID}}"></script>`
    },
    {
        id: "javascript",
        title: "Javascript",
        icon: "/languages/javascript.svg",
        script: `<script src="${DELIVERY_SOURCE}" data-organization-id="{{ORGANIZATION_ID}}"></script>`
    }
];