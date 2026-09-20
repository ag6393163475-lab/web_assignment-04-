const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const REQUEST_STATUSES = ["Pending", "Processing", "Fulfilled", "Rejected"];
const DONATION_GAP_DAYS = 90;
const LOW_STOCK_THRESHOLD = 5;

function daysSince(date) {
  if (!date) return Infinity;
  const ms = Date.now() - new Date(date).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function isEligible(lastDonationDate) {
  return daysSince(lastDonationDate) >= DONATION_GAP_DAYS;
}

function nextEligibleDate(lastDonationDate) {
  if (!lastDonationDate) return new Date();
  const next = new Date(lastDonationDate);
  next.setDate(next.getDate() + DONATION_GAP_DAYS);
  return next;
}

function formatDate(date) {
  if (!date) return "Never";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

module.exports = {
  BLOOD_GROUPS,
  REQUEST_STATUSES,
  DONATION_GAP_DAYS,
  LOW_STOCK_THRESHOLD,
  daysSince,
  isEligible,
  nextEligibleDate,
  formatDate
};
