import type { Route } from "../+types/root";
import Test from "../test/test";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Test Route" },
        { name: "description", content: "This is a test route." },
    ];
}

export default function TestRoute() {
    return <Test />;
}