import { URLSearchParams } from 'url';
import { definitions, operations } from '../../.temp/types'
import { JsonRequest } from 'http-req-builder';
import Ajv from 'ajv';
import SwaggerParser from "@apidevtools/swagger-parser";

async function loadAPISpec() {
    return SwaggerParser.dereference('http://93.126.97.71:10080/api/swagger.json');
}

function validate(schema: any, body: any) {
    const ajv = new Ajv({
        strict: false,
        allErrors: true,
        verbose: true,
        formats: {
            double: "[+-]?\\d*\\.?\\d+",
            int32: /^(-?\d{1,9}|-?1\d{9}|-?20\d{8}|-?21[0-3]\d{7}|-?214[0-6]\d{6}|-?2147[0-3]\d{5}|-?21474[0-7]\d{4}|-?214748[012]\d{4}|-?2147483[0-5]\d{3}|-?21474836[0-3]\d{2}|214748364[0-7]|-214748364[0-8])$/,
            int64: /^\d+$/,
        },
    });
    const validate = ajv.compile(schema);
    const valid = validate(body);
    if (!valid) {
        throw new Error(`Swagger validation errors: ${JSON.stringify({
            // body: body,
            validationErrors: validate.errors
        }, null, 2)}`)
    }
}

export class PetController {
    async addNew(pet: Omit<definitions['Pet'], "id">) {
        return (
            await new JsonRequest()
                .url(`http://93.126.97.71:10080/api/pet`)
                .method('POST')
                .body(pet)
                .send<Required<operations['addPet']['responses']['200']['schema']>>()
        ).body;
    }

    async update(pet: definitions['Pet']) {
        return (
            await new JsonRequest()
                .url(`http://93.126.97.71:10080/api/pet`)
                .method('PUT')
                .body(pet)
                .send<operations['updatePet']['responses']['200']['schema']>()
        ).body;
    }

    async delete(id: number | string) {
        return (
            await new JsonRequest()
                .url(`http://93.126.97.71:10080/api/pet/${id}`)
                .method('DELETE')
                .send<{ message: string }>()
        ).body;
    }

    async findByTags(tags: string | string[]) {
        return (
            await new JsonRequest()
                .url(`http://93.126.97.71:10080/api/pet/findByTags`)
                .searchParams(new URLSearchParams({ tags }))
                .send<operations['findPetsByTags']['responses']['200']['schema']>()
        ).body;
    }

    async findByStatus(status: string | string[]) {
        return (
            await new JsonRequest()
                .url(`http://93.126.97.71:10080/api/pet/findByStatus`)
                .searchParams(new URLSearchParams({ status }))
                .send<operations['findPetsByStatus']['responses']['200']['schema']>()
        ).body;
    }

    async getById(id: number | string) {
        let body = (
            await new JsonRequest()
                .url(`http://93.126.97.71:10080/api/pet/${id}`)
                .send<operations['getPetById']['responses']['200']['schema']>()
        ).body;

        const apiSpec = await loadAPISpec()
        const schema = apiSpec.paths['/pet/{petId}']['get']['responses']['200']['schema']

        body = { test: 'hello' } as any
        validate(schema, body)

        return body
    }
}