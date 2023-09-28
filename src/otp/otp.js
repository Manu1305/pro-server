var unirest = require("unirest");

var req = unirest("GET", "https://www.fast2sms.com/dev/bulkV2");

req.query({
  "authorization": "BLHFvewrGpNhE56Wj1Y0z4qUAmnPt3VlaMQsSo2kJRdcgCTZDfu2zZ6g0rNfVT4KCcR1lODpBLwUHW7v",
  "variables_values": "5599",
  "route": "otp",
  "numbers": "8943293217"
});

req.headers({
  "cache-control": "no-cache"
});


req.end(function (res) {
  if (res.error) throw new Error(res.error);

  console.log(res.body);
});