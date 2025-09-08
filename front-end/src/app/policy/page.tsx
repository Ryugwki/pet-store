import Section from "@/components/shared/Section";

export const metadata = {
  title: "Policy",
};

export default function PolicyPage() {
  return (
    <>
      <Section title="Policy" center>
        <ul className="list-disc list-outside pl-5 space-y-2 text-base leading-relaxed">
          <li>Registered kittens with vet check-up and sales agreement.</li>
          <li>
            Parents/ancestors health tested for HCM/PKD (ultrasound), HD
            (X-ray), and DNA.
          </li>
          <li>Kittens tested for FeLV/FIV and parasites.</li>
        </ul>
      </Section>

      <Section title="Reservation Process" center>
        <ul className="list-disc list-outside pl-5 space-y-2 text-base leading-relaxed">
          <li>
            <span className="font-semibold">Deposit:</span> A $500
            non-refundable deposit is required to secure your spot on the
            waiting list.
          </li>
          <li>
            <span className="font-semibold">Second Deposit:</span> An additional
            $500 deposit is due 4 weeks after the kittens are born.
          </li>
          <li>
            <span className="font-semibold">Deposit Guarantee:</span> Your
            deposit guarantees a quality kitten from our 2024 litters, with your
            preferred gender, coat type, and color (subject to availability).
          </li>
          <li>
            <span className="font-semibold">Price:</span> $3000 for all colors.
          </li>
        </ul>
      </Section>
    </>
  );
}
