/**
 * Simple Weather API Test (ES Module version)
 * Usage: node test.js
 */

async function testAPI(url, name) {
  console.log(`\n🧪 Testing: ${name}`);
  console.log(`🌐 URL: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Test/1.0)',
        Accept: 'application/json',
      },
    });

    console.log(`📡 Status: ${response.status} ${response.statusText}`);

    const text = await response.text();
    console.log(`📊 Response length: ${text.length} chars`);
    console.log(`📄 Preview: ${text.substring(0, 150)}...`);

    if (response.ok) {
      try {
        const data = JSON.parse(text);
        console.log(`✅ SUCCESS: Valid JSON received`);

        // Extract weather info for wttr.in
        if (url.includes('wttr.in') && data.current_condition) {
          const current = data.current_condition[0];
          const area = data.nearest_area[0];
          console.log(
            `📍 ${area.areaName[0].value}: ${current.temp_C}°C, ${current.weatherDesc[0].value}`
          );
        }

        // Extract weather info for Open-Meteo
        if (url.includes('open-meteo') && data.current_weather) {
          const current = data.current_weather;
          console.log(
            `🌡️ Temperature: ${current.temperature}°C, Wind: ${current.windspeed} km/h`
          );
        }

        return true;
      } catch (e) {
        console.log(`❌ Invalid JSON: ${e.message}`);
        return false;
      }
    } else {
      console.log(`❌ HTTP Error: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Request Failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🌤️ Simple Weather API Test\n');

  const tests = [
    {
      name: 'wttr.in Hyderabad',
      url: 'https://wttr.in/Hyderabad?format=j1',
    },
    {
      name: 'wttr.in Delhi',
      url: 'https://wttr.in/Delhi?format=j1',
    },
    {
      name: 'Open-Meteo Hyderabad',
      url: 'https://api.open-meteo.com/v1/forecast?latitude=17.385&longitude=78.486&current_weather=true',
    },
  ];

  let successCount = 0;

  for (const test of tests) {
    const success = await testAPI(test.url, test.name);
    if (success) successCount++;

    // Wait 1 second between tests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(`\n🏁 Results: ${successCount}/${tests.length} APIs working`);

  if (successCount === 0) {
    console.log('❌ All APIs failed - possible network issue');
  } else if (successCount < tests.length) {
    console.log('⚠️ Some APIs failed - check which ones work');
  } else {
    console.log('✅ All APIs working - issue might be in browser extension');
  }
}

main().catch(console.error);
