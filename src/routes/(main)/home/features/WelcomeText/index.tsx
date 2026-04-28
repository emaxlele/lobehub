import { Flexbox } from '@lobehub/ui';
import { sample } from 'es-toolkit/compat';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const WelcomeText = memo(() => {
  const { t } = useTranslation('welcome');

  const sentence = useMemo(() => {
    const messages = t('welcomeMessages', { returnObjects: true }) as Record<string, string>;
    return sample(Object.values(messages));
  }, [t]);

  return (
    <Flexbox
      style={{
        fontSize: 16,
        paddingInlineStart: 5,
      }}
    >
      {sentence}
    </Flexbox>
  );
});

export default WelcomeText;
