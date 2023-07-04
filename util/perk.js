exports.getServerBitrate = async function(tier) {
  // Thanks to discord for pointing di this out.
  if(tier == "TIER_1"){
    // 8,64,96,128 Bps
    return [
      { label: "8 Bps", value: "8000" },
      { label: "64 Bps", value: "64000" },
      { label: "96 Bps", value: "96000" },
      { label: "128 Bps", value: "128000" }
    ]
  } else if(tier == "TIER_2"){
    // 8,64,96,128,256 Bps
    return [
      { label: "8 Bps", value: "8000" },
      { label: "64 Bps", value: "64000" },
      { label: "96 Bps", value: "96000" },
      { label: "128 Bps", value: "128000" },
      { label: "256 Bps", value: "256000" }
    ]
  } else if(tier == "TIER_3"){
    // 8,64,96,128,256,384 Bps
    return [
      { label: "8 Bps", value: "8000" },
      { label: "64 Bps", value: "64000" },
      { label: "96 Bps", value: "96000" },
      { label: "128 Bps", value: "128000" },
      { label: "256 Bps", value: "256000" },
      { label: "384 Bps", value: "384000" }
    ]
  } else {
    // 8,64,96 Bps
    return [
      { label: "8 Bps", value: "8000" },
      { label: "64 Bps", value: "64000" },
      { label: "96 Bps", value: "96000" }
    ]
  }
}