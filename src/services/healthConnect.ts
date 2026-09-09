import { Platform } from 'react-native';

const STEP_READ_PERMISSION = {
  accessType: 'read',
  recordType: 'Steps',
} as const;

export async function getTodayStepCount(): Promise<number | null> {
  if (Platform.OS !== 'android') {
    return null;
  }

  const {
    aggregateRecord,
    getGrantedPermissions,
    getSdkStatus,
    initialize,
    requestPermission,
    SdkAvailabilityStatus,
  } = await import('react-native-health-connect');

  const sdkStatus = await getSdkStatus();

  if (sdkStatus !== SdkAvailabilityStatus.SDK_AVAILABLE) {
    return null;
  }

  const isInitialized = await initialize();

  if (!isInitialized) {
    return null;
  }

  const grantedPermissions = await getGrantedPermissions();
  let isStepReadGranted = grantedPermissions.some(
    (permission) =>
      permission.accessType === 'read' &&
      permission.recordType === 'Steps',
  );

  if (!isStepReadGranted) {
    const requestedPermissions = await requestPermission([
      STEP_READ_PERMISSION,
    ]);

    isStepReadGranted = requestedPermissions.some(
      (permission) =>
        permission.accessType === 'read' &&
        permission.recordType === 'Steps',
    );
  }

  if (!isStepReadGranted) {
    return null;
  }

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const result = await aggregateRecord({
    recordType: 'Steps',
    timeRangeFilter: {
      operator: 'between',
      startTime: startOfToday.toISOString(),
      endTime: now.toISOString(),
    },
  });

  return result.COUNT_TOTAL ?? 0;
}
