const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:4000/graphql';

async function graphql(query, variables = {}, token = null) {
  const response = await fetch(GATEWAY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ query, variables })
  });

  const payload = await response.json();
  if (!response.ok || payload.errors) {
    const message = payload.errors?.map((error) => error.message).join('; ') || response.statusText;
    throw new Error(message);
  }
  return payload.data;
}

async function seed() {
  console.log('Seeding data...');

  const loginData = await graphql(`
    mutation Login($input: LoginInput!) {
      login(input: $input) {
        token
      }
    }
  `, {
    input: { email: 'admin@smarttraffic.tn', password: 'admin123' }
  });

  const token = loginData.login.token;

  const vehicles = [
    { plateNumber: '123 TN 4567', brand: 'Toyota', model: 'Corolla', type: 'CAR', year: 2023, color: 'Blanc', ownerName: 'Ahmed Ben Ali', ownerPhone: '+216 20 123 456' },
    { plateNumber: '456 TN 7890', brand: 'Peugeot', model: '208', type: 'CAR', year: 2022, color: 'Noir', ownerName: 'Sami Trabelsi', ownerPhone: '+216 21 456 789' },
    { plateNumber: '789 TN 1234', brand: 'Renault', model: 'Master', type: 'TRUCK', year: 2021, color: 'Bleu', ownerName: 'Transport Express', ownerPhone: '+216 22 789 012' },
    { plateNumber: '321 TN 6540', brand: 'Honda', model: 'CBR', type: 'MOTORCYCLE', year: 2023, color: 'Rouge', ownerName: 'Karim Moussa', ownerPhone: '+216 23 321 654' },
    { plateNumber: '654 TN 9871', brand: 'Mercedes', model: 'Sprinter', type: 'BUS', year: 2020, color: 'Blanc', ownerName: 'Bus Tunis', ownerPhone: '+216 24 654 987' }
  ];

  for (const input of vehicles) {
    try {
      await graphql(`
        mutation CreateVehicle($input: CreateVehicleInput!) {
          createVehicle(input: $input) {
            id
          }
        }
      `, { input }, token);
    } catch (error) {
      if (!error.message.includes('plaque existe')) throw error;
    }
  }
  console.log('- Vehicles ready');

  const zones = [
    { name: 'Centre-ville Tunis', description: 'Zone centrale', coordinates: [{ lat: 36.81, lng: 10.18 }, { lat: 36.81, lng: 10.19 }, { lat: 36.80, lng: 10.19 }, { lat: 36.80, lng: 10.18 }], centerLat: 36.805, centerLng: 10.185 },
    { name: 'La Marsa', description: 'Zone cotiere', coordinates: [{ lat: 36.89, lng: 10.32 }, { lat: 36.89, lng: 10.33 }, { lat: 36.88, lng: 10.33 }, { lat: 36.88, lng: 10.32 }], centerLat: 36.885, centerLng: 10.325 },
    { name: 'Ariana', description: 'Zone nord', coordinates: [{ lat: 36.86, lng: 10.18 }, { lat: 36.86, lng: 10.19 }, { lat: 36.85, lng: 10.19 }, { lat: 36.85, lng: 10.18 }], centerLat: 36.855, centerLng: 10.185 },
    { name: 'Ben Arous', description: 'Zone sud', coordinates: [{ lat: 36.75, lng: 10.22 }, { lat: 36.75, lng: 10.23 }, { lat: 36.74, lng: 10.23 }, { lat: 36.74, lng: 10.22 }], centerLat: 36.745, centerLng: 10.225 }
  ];

  for (const input of zones) {
    await graphql(`
      mutation CreateZone($input: CreateZoneInput!) {
        createZone(input: $input) {
          id
        }
      }
    `, { input }, token);
  }
  console.log('- Zones ready');

  const incidents = [
    { type: 'ACCIDENT', title: 'Accident autoroute A1', description: 'Collision entre 2 voitures', latitude: 36.85, longitude: 10.25, address: 'Autoroute A1, km 15', severity: 'HIGH' },
    { type: 'TRAVAUX', title: 'Travaux route principale', description: 'Reparation de la chaussee', latitude: 36.80, longitude: 10.18, address: 'Avenue Habib Bourguiba', severity: 'MEDIUM' },
    { type: 'EMBOUTEILLAGE', title: 'Fort ralentissement', description: 'Embouteillage matinal', latitude: 36.81, longitude: 10.19, address: 'Boulevard Mohamed VI', severity: 'LOW' }
  ];

  for (const input of incidents) {
    await graphql(`
      mutation DeclareIncident($input: DeclareIncidentInput!) {
        declareIncident(input: $input) {
          id
        }
      }
    `, { input }, token);
  }
  console.log('- Incidents ready');

  await graphql(`
    mutation CalculateAllDensities {
      calculateAllDensities {
        id
        name
        density
      }
    }
  `, {}, token);
  console.log('- Densities calculated');

  console.log('Seed completed successfully.');
}

seed().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
