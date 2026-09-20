import { XMLParser } from 'fast-xml-parser';
const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    trimValues: true,
    parseTagValue: false,
    removeNSPrefix: true,
});
function normalizeString(value) {
    return String(value ?? '').trim();
}
export function transformVehicleMakesXml(xml) {
    const parsed = parser.parse(xml);
    const rawMakes = parsed?.Response?.Results?.AllVehicleMakes;
    const list = Array.isArray(rawMakes) ? rawMakes : rawMakes ? [rawMakes] : [];
    return list
        .map((item) => ({
        makeId: normalizeString(item?.Make_ID),
        makeName: normalizeString(item?.Make_Name),
    }))
        .filter((item) => item.makeId && item.makeName);
}
export function transformVehicleTypesXml(xml) {
    const parsed = parser.parse(xml);
    const rawTypes = parsed?.Response?.Results?.VehicleTypesForMakeIds;
    const list = Array.isArray(rawTypes) ? rawTypes : rawTypes ? [rawTypes] : [];
    return list
        .map((item) => ({
        typeId: normalizeString(item?.VehicleTypeId),
        typeName: normalizeString(item?.VehicleTypeName),
    }))
        .filter((item) => item.typeId && item.typeName);
}
export async function ingestVehicleData({ makesUrl, vehicleTypesUrlTemplate, fetcher = fetch, }) {
    const makesResponse = await fetcher(makesUrl, { method: 'GET' });
    if (!makesResponse.ok) {
        throw new Error(`Failed to fetch vehicle makes: ${makesResponse.status}`);
    }
    const makesXml = await makesResponse.text();
    const makes = transformVehicleMakesXml(makesXml);
    const merged = [];
    for (const make of makes) {
        const url = vehicleTypesUrlTemplate.replace('{makeId}', encodeURIComponent(make.makeId));
        try {
            const typesResponse = await fetcher(url, { method: 'GET' });
            if (!typesResponse.ok) {
                merged.push({ ...make, vehicleTypes: [] });
                continue;
            }
            const typesXml = await typesResponse.text();
            const vehicleTypes = transformVehicleTypesXml(typesXml);
            merged.push({ ...make, vehicleTypes });
        }
        catch (error) {
            merged.push({ ...make, vehicleTypes: [] });
            if (error instanceof Error) {
                console.warn(`Skipping vehicle types for make ${make.makeId}: ${error.message}`);
            }
        }
    }
    return merged;
}
