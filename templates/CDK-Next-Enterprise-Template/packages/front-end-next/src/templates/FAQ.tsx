import { useTranslations } from 'next-intl';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Section } from '@/features/landing/Section';

type FAQProps = {
  namespace: string;
};

const FAQ = ({ namespace }: FAQProps) => {
  const t = useTranslations(namespace);

  return (
    <Section>
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>{t('FAQ.question1')}</AccordionTrigger>
          <AccordionContent>{t('FAQ.answer1')}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>{t('FAQ.question2')}</AccordionTrigger>
          <AccordionContent>{t('FAQ.answer2')}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>{t('FAQ.question3')}</AccordionTrigger>
          <AccordionContent>{t('FAQ.answer3')}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger>{t('FAQ.question4')}</AccordionTrigger>
          <AccordionContent>{t('FAQ.answer4')}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-5">
          <AccordionTrigger>{t('FAQ.question5')}</AccordionTrigger>
          <AccordionContent>{t('FAQ.answer5')}</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-6">
          <AccordionTrigger>{t('FAQ.question6')}</AccordionTrigger>
          <AccordionContent>{t('FAQ.answer6')}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </Section>
  );
};

export { FAQ };
