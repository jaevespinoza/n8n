import { IExecuteFunctions } from 'n8n-core';

import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription
} from 'n8n-workflow';

interface IDatasetId {
	dataset_id: number;
}

interface IExecutions {
	model_id: number;
	text_fields: ReadonlyArray<string>;
}

interface IContent {
	[key: string]: {
		value: string;
	};
}

interface IPost {
	readonly type: 'n8n' | 'dataset_save';
	readonly post_data: {
		readonly flow?: string;
		readonly executions?: ReadonlyArray<IExecutions>;
	};
}

interface IDocument {
	content: {
		[key: string]: {
			value: string;
		};
	};
	post: ReadonlyArray<any>;
	executions?: ReadonlyArray<IExecutions>;
	dataset?: ReadonlyArray<{
		dataset_id: number;
	}>;
	integrationKey: ReadonlyArray<number>;
}

interface IAttribute {
	readonly attributes: {
		readonly property: {
			attributeId: string;
			attributeValue: string;
		}[];
	};
}

interface IN8NFlow {
	readonly n8nflows: {
		readonly n8nProperty: {
			readonly flowName: string;
		}[];
	};
}

interface IDataset {
	readonly datasetsToCollect: {
		readonly datasetProperty: {
			readonly datasetId: string;
		}[];
	};
}

interface IModelTextField {
	readonly modelsToCollect: {
		readonly modelProperty: {
			readonly modelId: string;
			readonly textFieldValues: string;
		}[];
	};
}

interface IIntegration {
	readonly integrations: {
		readonly integrationProperty: {
			readonly integrationId: string;
		}[];
	};
}

export class IntegrationDoc implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'IntegrationDoc',
		name: 'integrationDoc',
		icon: 'file:wholemeaning.svg',
		group: ['transform'],
		version: 1,
		description: 'Create documents for Integration API',
		defaults: {
			name: 'IntegrationDoc',
			color: '#1A82e2'
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [],
		properties: [
			{
				displayName: 'Tipo de documento',
				name: 'documentType',
				type: 'options',
				options: [
					{
						name: 'Dataset',
						value: 'dataset'
					},
					{
						name: 'Modelo',
						value: 'model'
					},
					{
						name: 'Integración',
						value: 'integration'
					}
				],
				default: 'dataset',
				required: true,
				description: 'Tipo de documento a mandar'
			},
			{
				displayName: 'Derivar a N8N',
				name: 'deriven8n',
				type: 'options',
				options: [
					{
						name: 'Si',
						value: 'yes',
						description: 'Derivar a nodo N8N'
					},
					{
						name: 'No',
						value: 'no',
						description: 'No derivar a nodo N8N'
					}
				],
				default: 'no',
				description: 'Ver si el documento se deriva a N8N o no'
			},
			{
				displayName: 'Derivar a base de datos',
				name: 'derivebd',
				type: 'options',
				options: [
					{
						name: 'Si',
						value: 'yes',
						description: 'Derivar a base de datos'
					},
					{
						name: 'No',
						value: 'no',
						description: 'No derivar a base de datos'
					}
				],
				default: 'no',
				description: 'Ver si el documento se deriva a N8N o no'
			},
			{
				displayName: 'Flujo de N8N',
				name: 'n8nflowCollection',
				displayOptions: {
					show: {
						deriven8n: ['yes']
					}
				},
				type: 'collection',
				placeholder: 'Añadir flujo de N8N',
				default: {},
				options: [
					{
						displayName: 'Flujo de N8N',
						name: 'n8nflows',
						placeholder: 'Añadir flujo',
						description:
							'Añadir flujos N8N a los cual se derivará el documento',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true
						},
						default: {},
						options: [
							{
								name: 'n8nProperty',
								displayName: 'Flujo N8N',
								values: [
									{
										displayName: 'Nombre del flujo',
										name: 'flowName',
										type: 'string',
										default: '',
										description: 'Nombre del flujo N8N'
									}
								]
							}
						]
					}
				]
			},
			{
				displayName: 'Contenido',
				name: 'content',
				type: 'collection',
				placeholder: 'Contenido de documento',
				default: {},
				options: [
					{
						displayName: 'Atributos',
						name: 'attributes',
						placeholder: 'Añadir atributos',
						description:
							'Añadir atributos que luego serán utilizados para el procesamiento',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true
						},
						default: {},
						options: [
							{
								name: 'property',
								displayName: 'Atributo',
								values: [
									{
										displayName: 'Id de atributo',
										name: 'attributeId',
										type: 'string',
										default: '',
										description: 'Id del atributo a colocar'
									},
									{
										displayName: 'Valor de atributo',
										name: 'attributeValue',
										type: 'string',
										default: '',
										description: 'Valor del atributo a colocar'
									}
								]
							}
						]
					}
				]
			},
			{
				displayName: 'Datasets',
				displayOptions: {
					show: {
						documentType: ['dataset']
					}
				},
				name: 'datasetCollection',
				type: 'collection',
				placeholder: 'Datasets a utilizar',
				default: {},
				options: [
					{
						displayName: 'Datasets',
						name: 'datasetsToCollect',
						placeholder: 'Añadir datasets',
						description:
							'Añadir datasets que luego serán utilizados para guardar información',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true
						},
						default: {},
						options: [
							{
								name: 'datasetProperty',
								displayName: 'Id de dataset',
								values: [
									{
										displayName: 'Id de dataset',
										name: 'datasetId',
										type: 'string',
										default: '',
										description: 'Id del dataset a colocar'
									}
								]
							}
						]
					}
				]
			},
			{
				displayName: 'Modelos y campos de texto',
				displayOptions: {
					show: {
						documentType: ['model']
					}
				},
				name: 'modelCollection',
				type: 'collection',
				placeholder: 'Modelos y campos de texto',
				default: {},
				options: [
					{
						displayName: 'Modelo y campos de texto',
						name: 'modelsToCollect',
						placeholder: 'Añadir modelos',
						description:
							'Añadir modelos y campos de texto que serán utilizados para el procesamiento',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true
						},
						default: {},
						options: [
							{
								name: 'modelProperty',
								displayName: 'Atributo',
								values: [
									{
										displayName: 'Id de modelo',
										name: 'modelId',
										type: 'string',
										default: '',
										description: 'Id del modelo a usar'
									},
									{
										displayName: 'Campos de texto',
										name: 'textFieldValues',
										type: 'string',
										default: '',
										description: 'Campos de texto separados por coma'
									}
								]
							}
						]
					}
				]
			},
			{
				displayName: 'Colección de Integraciones',
				displayOptions: {
					show: {
						documentType: ['integration']
					}
				},
				name: 'integrationCollection',
				type: 'collection',
				placeholder: 'Integraciones a usar',
				default: {},
				options: [
					{
						displayName: 'Integraciónes',
						name: 'integrations',
						placeholder: 'Añadir integraciones',
						description:
							'Añadir integraciones que luego serán usadas por el procesamiento',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true
						},
						default: {},
						options: [
							{
								name: 'integrationProperty',
								displayName: 'Integración',
								values: [
									{
										displayName: 'Id de integración',
										name: 'integrationId',
										type: 'string',
										default: '',
										description: 'Id de la integración a usar'
									}
								]
							}
						]
					}
				]
			}
			// Node properties which the user gets displayed and
			// can change on the node.
		]
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];
		// Generar la variable que contendrá la colección de datos
		let collection: IDataset | IIntegration | IModelTextField | null;
		// Obtener el tipo de documento
		const type = this.getNodeParameter('documentType', 0) as string;
		// Obtener si es que se deriva a n8n o no
		const deriveN8N = this.getNodeParameter('deriven8n', 0) as string;
		// Obtener si es que se deriva a almacenamiento
		const deriveBD = this.getNodeParameter('derivebd', 0) as string;
		// Obtener el contenido que se añade
		const content = this.getNodeParameter('content', 0) as IAttribute;
		const postContent = [] as IPost[];
		const body = {} as IDocument;
		const documentContent = {} as IContent;
		const typeCollection = [] as (IExecutions | number | IDatasetId)[];
		// Recorrer el contenido y sus propiedades para obtener el id del atributo
		// y el contenido o valor.
		content.attributes.property.forEach(properties => {
			documentContent[properties.attributeId] = {
				value: properties.attributeValue
			};
		});

		// Si es que se deriva a N8N, se debe recorrer la colección de datos de n8n
		// y añadirlos a la lista de post contenido
		if (deriveN8N === 'yes') {
			const n8nFlow = this.getNodeParameter('n8nflowCollection', 0) as IN8NFlow;
			n8nFlow.n8nflows.n8nProperty.forEach(flow => {
				postContent.push({
					type: 'n8n',
					post_data: {
						flow: flow.flowName
					}
				});
			});
		}

		// 	Si es que se deriva a base de datos, se debe obtener la lista de ejecuciones
		// Si la lista de ejecuciones es vacia, se utilizan todas las ejecuciones dadas
		if (deriveBD === 'yes') {
			postContent.push({
				type: 'dataset_save',
				post_data: {
					executions: []
				}
			});
		}

		// Guardar el contenido y post procesamiento en el cuerpo
		body.post = postContent;
		body.content = documentContent;

		// Si el tipo de documento es modelo, entonces se obtiene la colección de modelo
		if (type === 'model') {
			collection = this.getNodeParameter(
				'modelCollection',
				0
			) as IModelTextField;

			// Se mapea sobre la colección de modelos y se obtienen los ids de modelos
			// y campos de texto escogidos
			collection.modelsToCollect.modelProperty.forEach(models => {
				typeCollection.push({
					model_id: Number(models.modelId),
					text_fields: models.textFieldValues.split(',')
				});
			});

			body.executions = typeCollection as IExecutions[];
			// Si el tipo es integración, se obtiene la colección de datos de integracion
			// y se mapea sobre ellos, guardandolos en el cuerpo del documento
		} else if (type === 'integration') {
			collection = this.getNodeParameter(
				'integrationsCollection',
				0
			) as IIntegration;

			collection.integrations.integrationProperty.map(integration => {
				typeCollection.push(Number(integration));
			});

			body.integrationKey = typeCollection as number[];
			// Por ultimo, si el tipo de documento es dataset, se obtienen los ids
			// de datasets entregados por el usuario y se mapean sobre ellos
		} else if (type === 'dataset') {
			collection = this.getNodeParameter('datasetCollection', 0) as IDataset;

			collection.datasetsToCollect.datasetProperty.map(dataset => {
				typeCollection.push({
					dataset_id: Number(dataset.datasetId)
				});
			});

			body.dataset = typeCollection as IDatasetId[];
			// Si es que por alguna razón se escogió otro tipo, se lanza un error
		} else {
			throw new Error('El tipo especificado no es compatible');
		}

		// Retornar el cuerpo del documento creado
		returnData.push({ body });

		return [this.helpers.returnJsonArray(returnData)];
	}
}
