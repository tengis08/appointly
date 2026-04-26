import type { MasterProfile } from "@/types/master";

export function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(value: number) {
  const hours = Math.floor(value / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (value % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function formatTimeLabel(value: string) {
  const [hoursRaw, minutes] = value.split(":").map(Number);
  const suffix = hoursRaw >= 12 ? "PM" : "AM";
  const hours12 = ((hoursRaw + 11) % 12) + 1;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${suffix}`;
}

export function parseDurationToMinutes(duration: string) {
  const match = duration.match(/\d+/);
  return match ? Number(match[0]) : 60;
}

export function getServiceByName(master: MasterProfile, serviceName: string) {
  return master.services.find((service) => service.name === serviceName) ?? null;
}

export function getDateDayOfWeek(dateString: string) {
  return new Date(`${dateString}T12:00:00`).getDay();
}

export function getWorkingDay(master: MasterProfile, dateString: string) {
  const dayOfWeek = getDateDayOfWeek(dateString);
  return (
    master.workingDays.find((workingDay) => workingDay.dayOfWeek === dayOfWeek) ??
    null
  );
}

export function buildAvailableSlots(
  master: MasterProfile,
  serviceName: string,
  dateString: string
) {
  const service = getServiceByName(master, serviceName);
  const workingDay = getWorkingDay(master, dateString);

  if (!service || !workingDay) {
    return [];
  }

  const serviceDurationMinutes = parseDurationToMinutes(service.duration);
  const startMinutes = timeToMinutes(workingDay.start);
  const endMinutes = timeToMinutes(workingDay.end);
  const latestStart = endMinutes - serviceDurationMinutes;

  if (latestStart < startMinutes) {
    return [];
  }

  const slots: string[] = [];
  let current = startMinutes;

  while (current <= latestStart) {
    slots.push(minutesToTime(current));
    current += master.slotStepMinutes;
  }

  return slots;
}

export function rangesOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number
) {
  return startA < endB && endA > startB;
}

type ExistingAppointmentLike = {
  appointment_time: string;
  service_name: string;
};

export function filterConflictingSlots(
  generatedSlots: string[],
  master: MasterProfile,
  requestedServiceName: string,
  existingAppointments: ExistingAppointmentLike[]
) {
  const requestedService = getServiceByName(master, requestedServiceName);

  if (!requestedService) {
    return [];
  }

  const requestedDuration = parseDurationToMinutes(requestedService.duration);

  return generatedSlots.filter((slot) => {
    const newStart = timeToMinutes(slot);
    const newEnd = newStart + requestedDuration;

    for (const appointment of existingAppointments) {
      const existingService = getServiceByName(master, appointment.service_name);

      if (!existingService) {
        continue;
      }

      const existingStart = timeToMinutes(appointment.appointment_time);
      const existingDuration = parseDurationToMinutes(existingService.duration);
      const existingEnd = existingStart + existingDuration;

      if (rangesOverlap(newStart, newEnd, existingStart, existingEnd)) {
        return false;
      }
    }

    return true;
  });
}

export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}