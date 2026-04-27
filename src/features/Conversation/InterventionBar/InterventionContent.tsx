import { cx } from 'antd-style';
import { memo } from 'react';

import Intervention from '../Messages/AssistantGroup/Tool/Detail/Intervention';
import { type PendingIntervention } from '../store/slices/data/pendingInterventions';
import { styles } from './style';

interface InterventionContentProps {
  floating?: boolean;
  intervention: PendingIntervention;
}

const InterventionContent = memo<InterventionContentProps>(({ intervention, floating }) => {
  return (
    <div className={cx(styles.content, floating && styles.floatingContent)}>
      <Intervention
        apiName={intervention.apiName}
        assistantGroupId={intervention.assistantGroupId}
        id={intervention.toolMessageId}
        identifier={intervention.identifier}
        requestArgs={intervention.requestArgs}
        toolCallId={intervention.toolCallId}
      />
    </div>
  );
});

export default InterventionContent;
