/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { ToastContainer, toast } from 'react-toastify';
import './app.scss';
import 'react-toastify/dist/ReactToastify.css';
import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
import { AddressTranslator } from 'nervos-godwoken-integration';

import { DiscussionWrapper } from '../lib/contracts/DiscussionWrapper';
import { CONFIG } from '../config';
import IdeaModal from './Modal';

interface ITopic {
    id: number;
    title: string;
    creator: string;
}
interface IdeaType {
    0: string;
    1: string;
    2: string;
    3: string;
    // comment: string;
    // creator: string;
    // id: string;
    // topicId: string;
}
async function createWeb3() {
    // Modern dapp browsers...
    if ((window as any).ethereum) {
        const godwokenRpcUrl = CONFIG.WEB3_PROVIDER_URL;
        const providerConfig = {
            rollupTypeHash: CONFIG.ROLLUP_TYPE_HASH,
            ethAccountLockCodeHash: CONFIG.ETH_ACCOUNT_LOCK_CODE_HASH,
            web3Url: godwokenRpcUrl
        };

        const provider = new PolyjuiceHttpProvider(godwokenRpcUrl, providerConfig);
        const web3 = new Web3(provider || Web3.givenProvider);

        try {
            // Request account access if needed
            await (window as any).ethereum.enable();
        } catch (error) {
            // User denied account access...
        }

        return web3;
    }

    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    return null;
}

export function App() {
    const [web3, setWeb3] = useState<Web3>(null);
    const [contract, setContract] = useState<DiscussionWrapper>();
    const [accounts, setAccounts] = useState<string[]>();
    const [l2Balance, setL2Balance] = useState<bigint>();
    const [polyjuiceAddress, setPolyjuiceAddress] = useState<string | undefined>();
    const [transactionInProgress, setTransactionInProgress] = useState(false);
    const toastId = React.useRef(null);
    const [newStoredNumberInputValue, setNewStoredNumberInputValue] = useState<
        number | undefined
    >();

    const [topicTitle, setTopicTitle] = useState<string>();
    const [currentTopicId, setCurrentTopicId] = useState<number>();
    const [topics, setTopics] = useState<ITopic[]>();
    const [loading, setLoading] = useState<boolean>();
    const [idea, setIdea] = useState<string>();
    const [topicIdeas, setTopicIdeas] = useState<IdeaType[]>();
    const [ideasLoading, setIdeasLoading] = useState<boolean>(false);
    useEffect(() => {
        if (accounts?.[0]) {
            const addressTranslator = new AddressTranslator();
            setPolyjuiceAddress(addressTranslator.ethAddressToGodwokenShortAddress(accounts?.[0]));
        } else {
            setPolyjuiceAddress(undefined);
        }
    }, [accounts?.[0]]);

    useEffect(() => {
        if (transactionInProgress && !toastId.current) {
            toastId.current = toast.info(
                'Transaction in progress. Confirm MetaMask signing dialog and please wait...',
                {
                    position: 'top-right',
                    autoClose: false,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    closeButton: false
                }
            );
        } else if (!transactionInProgress && toastId.current) {
            toast.dismiss(toastId.current);
            toastId.current = null;
        }
    }, [transactionInProgress, toastId.current]);

    useEffect(() => {
        if (contract && accounts) getTopics();
    }, [contract, accounts]);

    const account = accounts?.[0];

    const fetchIdeas = async (topicId: number) => {
        setIdeasLoading(true);
        setTopicIdeas([]);
        const _topicIdeas = await contract.fetchTopicIdeas(topicId, accounts?.[0]);
        console.log(_topicIdeas);
        setTopicIdeas(_topicIdeas);
        setIdeasLoading(false);
    };
    async function getTopic(topicId: number) {
        const topic = await contract.getTopic(topicId, account);
        return topic;
    }

    async function getTopics() {
        setLoading(true);
        const FIRST_TOPIC_ID = 1;
        const totalTopic = Number(await contract.getTotalTopic(account));
        const _topics = [];

        for (let topicId = FIRST_TOPIC_ID; topicId <= totalTopic; topicId++) {
            const topic = await getTopic(topicId);
            const newTopic = { id: Number(topic.id), creator: topic.creator, title: topic.title };
            _topics.push(newTopic);
        }
        setTopics(_topics);
        setLoading(false);
        toast('Successfully read all the topics', { type: 'success' });
    }

    async function createTopic() {
        if (topicTitle?.length === 0) {
            return;
        }
        try {
            setTransactionInProgress(true);
            await contract.createTopic(topicTitle, account);
            await getTopics();
            toast('Successfully created a new topic 🌻', { type: 'success' });
        } catch (error) {
            console.error(error);
            toast.error(
                'There was an error sending your transaction. Please check developer console.'
            );
        } finally {
            setTransactionInProgress(false);
        }
    }

    async function createIdea(topicId: number) {
        if (topicTitle?.length === 0) {
            return;
        }
        try {
            setTransactionInProgress(true);
            await contract.addIdeaToTopic(topicId, idea, account);
            setIdea('');
            await fetchIdeas(topicId);
            toast('Successfully created a new idea 🌻', { type: 'success' });
        } catch (error) {
            console.error(error);
            toast.error(
                'There was an error sending your transaction. Please check developer console.'
            );
        } finally {
            setTransactionInProgress(false);
        }
    }

    useEffect(() => {
        if (web3) {
            return;
        }

        (async () => {
            const _web3 = await createWeb3();
            setWeb3(_web3);

            const _accounts = [(window as any).ethereum.selectedAddress];
            setAccounts(_accounts);
            console.log({ _accounts });
            const _contract = new DiscussionWrapper(_web3);
            setContract(_contract);

            if (_accounts && _accounts[0]) {
                const _l2Balance = BigInt(await _web3.eth.getBalance(_accounts[0]));
                setL2Balance(_l2Balance);
            }
        })();
    });

    const LoadingIndicator = () => <span className="rotating-icon">⚙️</span>;

    return (
        <div className="app">
            <div className="nav">
                <h1>
                    UNSTOPPABLE DISCUSSIONS <small>by Nervos</small>{' '}
                </h1>
                <div className="balance">
                    L2 Balance:
                    <span>
                        <b>
                            {l2Balance ? (l2Balance / 10n ** 8n).toString() : <LoadingIndicator />}{' '}
                            CKB
                        </b>
                    </span>
                </div>

                <div className="accounts">
                    ETH:
                    <span>
                        {' '}
                        <b>{accounts?.[0]}</b>
                    </span>
                    Polyjuice:{' '}
                    <span>
                        <b>{polyjuiceAddress || ' - '}</b>
                    </span>
                </div>
            </div>

            <br />
            <br />
            <br />
            <div className="info">😺 Create Topics and give comments to existing topics</div>
            <br />
            <br />
            <br />
            <div className="create-topic">
                <h3>Write your topic title here:</h3>
                <input
                    type="text"
                    onChange={e => setTopicTitle(e.target.value)}
                    value={topicTitle}
                />
                <button onClick={createTopic}>Share Topic</button>
            </div>
            <hr />
            <h4>Topics 📚</h4>
            {loading && <LoadingIndicator />}
            <div className="show-topics">
                {topics &&
                    topics.map((topic, k) => {
                        return (
                            <div className="topic" key={k}>
                                <div>
                                    {' '}
                                    <b>Creator:</b>
                                    <small>{topic.creator}</small>
                                </div>
                                <h4>{topic.title}</h4>
                                <IdeaModal
                                    topicIdeas={topicIdeas}
                                    ideasLoading={ideasLoading}
                                    idea={idea}
                                    onIdeaChange={(e: any) => setIdea(e.target.value)}
                                    topic={topic}
                                    getIdeas={() => fetchIdeas(topic.id)}
                                    shareIdea={() => createIdea(topic.id)}
                                />
                            </div>
                        );
                    })}
            </div>
            <ToastContainer />
        </div>
    );
}
