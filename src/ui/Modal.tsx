import React, { useState } from 'react';
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';

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
}
interface Props {
    getIdeas: () => void;
    topic: ITopic;
    shareIdea?: () => void;
    onIdeaChange?: (e: any) => void;
    idea: string;
    topicIdeas: IdeaType[];
    ideasLoading: boolean;
}

const LoadingIndicator = () => <span className="rotating-icon">⚙️</span>;

const IdeaModal = (props: Props) => {
    const [open, setOpen] = useState(false);

    const onOpenModal = () => {
        setOpen(true);
        props.getIdeas();
    };
    const onCloseModal = () => setOpen(false);

    return (
        <div>
            <button onClick={onOpenModal}>Show Ideas</button>
            <Modal open={open} onClose={onCloseModal} center>
                <h2>{props.topic.title}</h2>
                <input
                    placeholder="write your idea"
                    onChange={props.onIdeaChange}
                    value={props.idea}
                />
                <button onClick={props.shareIdea}>Send</button>
                <hr />
                {props.ideasLoading && <LoadingIndicator />}
                {!props.ideasLoading && props.topicIdeas?.length === 0 && (
                    <small style={{ backgroundColor: '#CDC6A5', padding: '0.2rem' }}>
                        No idea found.Write the first idea for that topic
                    </small>
                )}
                <ul>
                    {props.topicIdeas &&
                        props.topicIdeas.length > 0 &&
                        props.topicIdeas.map(idea => {
                            return (
                                <li key={idea[0]} className="idea">
                                    {idea[2]}
                                </li>
                            );
                        })}
                </ul>
            </Modal>
        </div>
    );
};

export default IdeaModal;
